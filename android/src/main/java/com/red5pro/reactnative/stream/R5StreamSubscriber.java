package com.red5pro.reactnative.stream;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.red5pro.reactnative.view.PublishService;
import com.red5pro.reactnative.view.R5VideoViewLayout;
import com.red5pro.reactnative.view.SubscribeService;
import com.red5pro.streaming.R5Connection;
import com.red5pro.streaming.R5Stream;
import com.red5pro.streaming.config.R5Configuration;
import com.red5pro.streaming.event.R5ConnectionEvent;
import com.red5pro.streaming.media.R5AudioController;
import com.red5pro.streaming.view.R5VideoView;

public class R5StreamSubscriber implements R5StreamInstance,
		SubscribeService.SubscribeServicable {

	private static final String TAG = "R5StreamSubscriber";

	private ReactContext mContext;
	private DeviceEventManagerModule.RCTDeviceEventEmitter deviceEventEmitter;

	private int mEmitterId;
	private RCTEventEmitter mEventEmitter;

	private R5Configuration mConfiguration;
	private R5Connection mConnection;
	private R5Stream mStream;

	private int mLogLevel = 3;
	private int mAudioMode = 0;
	private int mScaleMode = 0;
	private boolean mPlaybackVideo = true;
	private boolean mShowDebugView = false;

	private boolean mIsStreaming;
	private boolean mIsBackgroundBound;
	private boolean mEnableBackgroundStreaming;
	private SubscribeService mBackgroundSubscribeService;
	private Intent mSubscribeIntent;

	private ServiceConnection mSubscribeServiceConnection = new ServiceConnection() {
		@Override
		public void onServiceConnected(ComponentName name, IBinder service) {
			Log.d(TAG, "connection:onServiceConnected()");
			mBackgroundSubscribeService = ((SubscribeService.SubscribeServiceBinder)service).getService();
			mBackgroundSubscribeService.setServicableDelegate(R5StreamSubscriber.this);
		}
		@Override
		public void onServiceDisconnected(ComponentName name) {
			Log.d(TAG, "connection:onServiceDisconnected()");
			mBackgroundSubscribeService = null;
		}
	};

	public enum Events {

		CONFIGURED("onConfigured"),
		METADATA("onMetaDataEvent"),
		SUBSCRIBER_STATUS("onSubscriberStreamStatus"),
		UNSUBSCRIBE_NOTIFICATION("onUnsubscribeNotification");

		private final String mName;

		Events(final String name) {
			mName = name;
		}

		@Override
		public String toString() {
			return mName;
		}

	}

	public R5StreamSubscriber (ThemedReactContext context) {
		Log.d(TAG, "new()");
		this.mContext = context;
		this.mContext.addLifecycleEventListener(this);
		this.deviceEventEmitter = mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
	}

	public R5StreamSubscriber (ReactApplicationContext context) {
		Log.d(TAG, "new()");
		this.mContext = context;
		this.mContext.addLifecycleEventListener(this);
		this.deviceEventEmitter = mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
	}

	protected void cleanup() {

		Log.d(TAG, ":cleanup (" + mConfiguration.getStreamName() + ")!");
		if (mStream != null) {
			mStream.client = null;
			mStream.setListener(null);
			mStream = null;
		}

		if (mConnection != null) {
			mConnection.removeListener();
			mConnection = null;
		}
		mIsStreaming = false;

	}

	protected void detectToStartService (Intent intent, ServiceConnection connection) {
		Log.d(TAG, "detectStartService()");
		boolean found = false;
		Activity activity = mContext.getCurrentActivity();
		ActivityManager actManager = (ActivityManager) activity.getSystemService(Context.ACTIVITY_SERVICE);
		try {
			for (ActivityManager.RunningServiceInfo serviceInfo : actManager.getRunningServices(Integer.MAX_VALUE)) {
				if (serviceInfo.service.getClassName().equals(PublishService.class.getName())) {
					found = true;
				}
			}
		} catch (NullPointerException e){}

		if(!found){
			Log.d(TAG, "detectStartService:start()");
			mContext.getCurrentActivity().startService(intent);
		}

		Log.d(TAG, "detectStartService:bind()");
		activity.bindService(intent, connection, Context.BIND_IMPORTANT);
		mIsBackgroundBound = true;
	}

	protected void establishConnection(R5Configuration configuration,
									 int audioMode,
									 int logLevel,
									 int scaleMode) {

		R5AudioController.mode = audioMode == 1
				? R5AudioController.PlaybackMode.STANDARD
				: R5AudioController.PlaybackMode.AEC;

		mConfiguration = configuration;
		mConnection = new R5Connection(configuration);
		mStream = new R5Stream(mConnection);

		mStream.setListener(this);
		mStream.client = this;

		mStream.setLogLevel(logLevel);
		mStream.setScaleMode(scaleMode);

	}

	protected void doSubscribe (String streamName) {

		Log.d(TAG, "doSubscribe()");
		if (mPlaybackVideo) {
			mStream.activate_display();
		} else {
			mStream.deactivate_display();
		}
		mStream.play(streamName);

	}

	public void subscribeBound () {

		Log.d(TAG, "doSubscribeBound()");
		doSubscribe(mConfiguration.getStreamName());

	}

	public R5StreamSubscriber subscribe (R5Configuration configuration,
										 boolean enableBackground) {

		return subscribe(configuration, true, enableBackground,
				mAudioMode, mLogLevel, mScaleMode, false);

	}

	public R5StreamSubscriber subscribe (R5Configuration configuration,
										 boolean playbackVideo,
										 boolean enableBackground) {

		return subscribe(configuration, playbackVideo, enableBackground,
				mAudioMode, mLogLevel, mScaleMode, false);

	}

    public R5StreamSubscriber subscribe (R5Configuration configuration,
                                         boolean playbackVideo,
                                         boolean enableBackground,
                                         int audioMode,
                                         int logLevel,
                                         int scaleMode) {

        return subscribe(configuration, playbackVideo, enableBackground,
                audioMode, logLevel, scaleMode, false);

    }

    public R5StreamSubscriber subscribe (R5Configuration configuration, R5StreamProps props) {

		Log.d(TAG, props.toString());
		return subscribe(configuration,
				props.subscribeVideo,
				props.enableBackgroundStreaming,
				props.audioMode,
				props.logLevel,
				props.scaleMode,
				props.showDebugView);

	}


	public R5StreamSubscriber subscribe (R5Configuration configuration,
										 boolean playbackVideo,
										 boolean enableBackground,
										 int audioMode,
										 int logLevel,
										 int scaleMode,
                                         boolean showDebugView) {

		mLogLevel = logLevel;
		mAudioMode = audioMode;
		mScaleMode = scaleMode;
		mPlaybackVideo = playbackVideo;
		mShowDebugView = showDebugView;

		establishConnection(configuration, audioMode, logLevel, scaleMode);

		Log.d(TAG, "Show Debug View? " + mShowDebugView);
		if (enableBackground) {
			Log.d(TAG, "Setting up bound subscriber for background streaming.");
			// Set up service and offload setup.
			mEnableBackgroundStreaming = true;
			mSubscribeIntent = new Intent(mContext.getCurrentActivity(), SubscribeService.class);
			detectToStartService(mSubscribeIntent, mSubscribeServiceConnection);
			return this;
		}

		doSubscribe(configuration.getStreamName());
		return this;

	}

	public void unsubscribe () {

		if (mStream != null && mIsStreaming) {
			mStream.stop();
		}
		else {
			WritableMap map = Arguments.createMap();
			this.emitEvent(R5VideoViewLayout.Events.UNSUBSCRIBE_NOTIFICATION.toString(), map);
			Log.d(TAG, "UNSUBSCRIBE");
			cleanup();
		}

	}

	public void setPlaybackVolume (float value) {
		Log.d(TAG, "setPlaybackVolume(" + value + ")");
		if (mIsStreaming) {
			if (mStream != null && mStream.audioController != null) {
				mStream.audioController.setPlaybackGain(value);
			}
		}
	}

	public void setVideoView (R5VideoView view) {
		Log.d(TAG, "setVideoView(" + mShowDebugView + ")");
		if (mStream != null) {
			view.attachStream(mStream);
			view.showDebugView(mShowDebugView);
			if (mPlaybackVideo) {
				mStream.activate_display();
			}
		}
	}

	public void removeVideoView (R5VideoView view) {
		Log.d(TAG, "removeVideoView()");
		if (mStream != null) {
            view.showDebugView(false);
			mStream.deactivate_display();
		}
		if (view != null) {
			view.attachStream(null);
		}
	}

	protected void setSubscriberDisplayOn (Boolean setOn) {

		Log.d(TAG, "setSubscriberDisplayOn(" + setOn + ")");
		if (!setOn) {
			if (mStream != null) {
				Log.d(TAG, "Stream:deactivate_display()");
				mStream.deactivate_display();
			}
		} else if (mStream != null && mPlaybackVideo) {
			Log.d(TAG, "Stream:activate_display()");
			mStream.activate_display();

		}

		if (mBackgroundSubscribeService != null) {
			mBackgroundSubscribeService.setDisplayOn(setOn);
		}

	}

	protected void sendToBackground () {

		Log.d(TAG, "sendToBackground()");
		if (!mEnableBackgroundStreaming) {
			Log.d(TAG, "sendToBackground:shutdown");
			this.unsubscribe();
			return;
		}

		if (mIsStreaming && mEnableBackgroundStreaming) {
			Log.d(TAG, "sendToBackground:subscriberPause");
			this.setSubscriberDisplayOn(false);
		}

	}

	protected void bringToForeground () {

		Log.d(TAG, "bringToForeground()");
		if (mIsStreaming && mEnableBackgroundStreaming) {
			Log.d(TAG, "sendToBackground:publiserResume");
			this.setSubscriberDisplayOn(true);
		}

	}

	protected void emitEvent (String type, WritableMap map) {
		if (mEventEmitter != null) {
			mEventEmitter.receiveEvent(this.getEmitterId(), type, map);
		} else {
			deviceEventEmitter.emit(type, map);
		}
	}

	public void onMetaData(String metadata) {

		Log.d(TAG, "onMetaData() : " + metadata);
		WritableMap map = new WritableNativeMap();
		map.putString("metadata", metadata);
		this.emitEvent(R5StreamSubscriber.Events.METADATA.toString(), map);

	}

	@Override
	public void onConnectionEvent(R5ConnectionEvent event) {

		Log.d(TAG, ":onConnectionEvent " + event.name());
		WritableMap map = new WritableNativeMap();
		WritableMap statusMap = new WritableNativeMap();
		statusMap.putInt("code", event.value());
		statusMap.putString("message", event.message);
		statusMap.putString("name", event.name());
		statusMap.putString("streamName", mConfiguration.getStreamName());
		map.putMap("status", statusMap);

		this.emitEvent(R5StreamSubscriber.Events.SUBSCRIBER_STATUS.toString(), map);

		if (event == R5ConnectionEvent.START_STREAMING) {
			mIsStreaming = true;
		}
		else if (event == R5ConnectionEvent.DISCONNECTED && mIsStreaming) {
			WritableMap evt = new WritableNativeMap();
			this.emitEvent(R5StreamSubscriber.Events.UNSUBSCRIBE_NOTIFICATION.toString(), evt);
			Log.d(TAG, "DISCONNECT");
			cleanup();
			mIsStreaming = false;
		}

	}

	public void updateSubscribeVideo(boolean playbackVideo) {
		this.mPlaybackVideo = playbackVideo;
	}

	public void updateScaleMode(int mode) {
		this.mScaleMode = mode;
		if (mStream != null) {
			mStream.setScaleMode(mode);
		}
	}

	public void updateLogLevel(int level) {
		this.mLogLevel = level;
		if (mStream != null) {
			mStream.setLogLevel(level);
		}
	}

	public void updateSubscriberAudioMode(int value) {
		this.mAudioMode = value;
	}

	public int getEmitterId () {
		return this.mEmitterId;
	}

	public void setEmitterId (int id) {
		this.mEmitterId = id;
		if (mEmitterId > -1 && mEventEmitter == null) {
			mEventEmitter = mContext.getJSModule(RCTEventEmitter.class);
		} else if (mEmitterId < 0) {
			mEventEmitter = null;
		}
	}

	@Override
	public void onHostResume() {
		Log.d(TAG, "onHostResume()");
		bringToForeground();
	}

	@Override
	public void onHostPause() {
		Log.d(TAG, "onHostPause()");
		sendToBackground();
	}

	@Override
	public void onHostDestroy() {
		Log.d(TAG, "onHostDestroy()");
		Activity activity = mContext.getCurrentActivity();
		if (mSubscribeIntent != null && mIsBackgroundBound) {
			this.setSubscriberDisplayOn(false);
			activity.unbindService(mSubscribeServiceConnection);
			activity.stopService(mSubscribeIntent);
			mIsBackgroundBound = false;
		}
	}

}
