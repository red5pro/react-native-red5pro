package com.red5pro.reactnative.stream;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.hardware.Camera;
import android.os.IBinder;
import android.util.Log;
import android.view.Surface;

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
import com.red5pro.streaming.R5Connection;
import com.red5pro.streaming.R5Stream;
import com.red5pro.streaming.R5StreamProtocol;
import com.red5pro.streaming.config.R5Configuration;
import com.red5pro.streaming.event.R5ConnectionEvent;
import com.red5pro.streaming.media.R5AudioController;
import com.red5pro.streaming.source.R5AdaptiveBitrateController;
import com.red5pro.streaming.source.R5Camera;
import com.red5pro.streaming.source.R5Microphone;
import com.red5pro.streaming.view.R5VideoView;

public class R5StreamPublisher implements R5StreamInstance,
		PublishService.PublishServicable {

	private static final String TAG = "R5StreamPublisher";

	private ReactContext mContext;
	private DeviceEventManagerModule.RCTDeviceEventEmitter deviceEventEmitter;

	private int mEmitterId;
	private RCTEventEmitter mEventEmitter;

	private int mLogLevel = 3;
	private int mAudioMode = 0;
	private int mScaleMode = 0;
	private R5Stream.RecordType mStreamType = R5Stream.RecordType.Live;
	private boolean mShowDebugView = false;

	private R5Configuration mConfiguration;
	private R5Connection mConnection;
	protected R5Camera mCamera;
	private R5Stream mStream;

	protected boolean mUseVideo = true;
	protected boolean mUseAudio = true;
	protected int mCameraWidth = 640;
	protected int mCameraHeight = 360;
	protected int mBitrate = 750;
	protected int mFramerate = 15;
	protected int mAudioBitrate = 32;
	protected int mAudioSampleRate = 44100;
	protected boolean mUseAdaptiveBitrateController = false;
	protected boolean mUseBackfacingCamera = false;
	protected boolean mUseEncryption = false;

	protected boolean mIsPublisherSetup;
	protected boolean mIsRestrainingVideo;

	protected int mCameraOrientation;
	protected int mDisplayOrientation;
	protected boolean mOrientationDirty;
	protected int mOrigCamOrientation = 0;

	private boolean mIsStreaming;
	private boolean mIsBackgroundBound;
	private boolean mEnableBackgroundStreaming;
	protected PublishService mBackgroundPublishService;
	private Intent mPubishIntent;

	private ServiceConnection mPublishServiceConnection = new ServiceConnection() {
		@Override
		public void onServiceConnected(ComponentName name, IBinder service) {
			Log.d(TAG, "connection:onServiceConnected()");
			mBackgroundPublishService = ((PublishService.PublishServiceBinder)service).getService();
			mBackgroundPublishService.setServicableDelegate(R5StreamPublisher.this);
		}
		@Override
		public void onServiceDisconnected(ComponentName name) {
			Log.d(TAG, "connection:onServiceDisconnected()");
			mBackgroundPublishService = null;
		}
	};

	public enum Events {

		CONFIGURED("onConfigured"),
		METADATA("onMetaDataEvent"),
		PUBLISHER_STATUS("onPublisherStreamStatus"),
		UNPUBLISH_NOTIFICATION("onUnpublishNotification");

		private final String mName;

		Events(final String name) {
			mName = name;
		}

		@Override
		public String toString() {
			return mName;
		}

	}

	public R5StreamPublisher(ThemedReactContext context) {
		Log.d(TAG, "new()");
		this.mContext = context;
		this.mContext.addLifecycleEventListener(this);
		this.deviceEventEmitter = mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
	}

	public R5StreamPublisher(ReactApplicationContext context) {
		Log.d(TAG, "new()");
		this.mContext = context;
		this.mContext.addLifecycleEventListener(this);
		this.deviceEventEmitter = mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
	}

	protected void unpackProps (R5StreamProps props, R5StreamPublisher target) {

		target.mLogLevel = props.logLevel;
		target.mScaleMode = props.scaleMode;
		target.mAudioMode = props.audioMode;
		target.mShowDebugView = props.showDebugView;
		target.mUseVideo = props.publishVideo;
		target.mUseAudio = props.publishAudio;
		target.mCameraWidth = props.cameraWidth;
		target.mCameraHeight = props.cameraHeight;
		target.mBitrate = props.bitrate;
		target.mFramerate = props.framerate;
		target.mAudioBitrate = props.audioBitrate;
		target.mAudioSampleRate = props.audioSampleRate;
		target.mUseBackfacingCamera = props.useBackfacingCamera;
		target.mUseEncryption = props.useEncryption;
		target.mEnableBackgroundStreaming = props.enableBackgroundStreaming;
		target.mUseAdaptiveBitrateController = props.useAdaptiveBitrateController;

	}

	protected void cleanup() {

		Log.d(TAG, ":cleanup (" + mConfiguration.getStreamName() + ")!");
		if (mStream != null) {
			mStream.attachCamera(null);
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

	public void publish (R5Configuration configuration,
						 R5Stream.RecordType recordType,
						 R5StreamProps props) {

		unpackProps(props, this);
		Log.d(TAG, props.toString());
		publish(configuration,
				recordType,
				mEnableBackgroundStreaming,
				mAudioMode,
				mLogLevel,
				mScaleMode,
				mShowDebugView,
				mUseEncryption);

	}

	public void publish (R5Configuration configuration,
						 R5Stream.RecordType recordType,
						 boolean enableBackground) {

		this.publish(configuration,
				recordType,
				enableBackground,
				mAudioMode,
				mLogLevel,
				mScaleMode,
				false, false);

	}

	public void publishBound () {

		Log.d(TAG, "doPublishBound()");
		doPublish(mConfiguration.getStreamName(), mStreamType);

	}

	public void publish (R5Configuration configuration,
						 R5Stream.RecordType recordType,
						 boolean enableBackground,
						 int audioMode,
						 int logLevel,
						 int scaleMode,
						 boolean showDebugView,
						 boolean useEncryption) {

		mStreamType = recordType;
		mShowDebugView = showDebugView;

		if (useEncryption) {
			configuration.setProtocol(R5StreamProtocol.SRTP);
		}
		establishConnection(configuration, audioMode, logLevel, scaleMode);

		Log.d(TAG, "Show Debug View? " + mShowDebugView);
		if (enableBackground) {
			Log.d(TAG, "setting up bound publisher for background streaming.");
			// Set up service and offload setup.
			mEnableBackgroundStreaming = true;
			mPubishIntent = new Intent(mContext.getCurrentActivity(), PublishService.class);
			detectToStartService(mPubishIntent, mPublishServiceConnection);
			return;
		}

		doPublish(mConfiguration.getStreamName(), mStreamType);

	}

	public void unpublish () {

		Log.d(TAG, "unpublish()");

		if (mCamera != null) {
			try {
				Camera c = mCamera.getCamera();
				c.stopPreview();
				c.release();
			} catch (Exception e) {
				Log.w(TAG, "unpublish:stop:error  " + e.getMessage());
			}
			mCamera = null;
		}

		if (mStream != null && mIsStreaming) {
			mStream.stop();
		} else {
			WritableMap map = Arguments.createMap();
			this.emitEvent(R5VideoViewLayout.Events.UNPUBLISH_NOTIFICATION.toString(), map);
			Log.d(TAG, "UNPUBLISH");
			cleanup();
		}

	}

	public void swapCamera () {

		Camera updatedCamera;

		if (mCamera == null) {
			return;
		}

		if (mCamera.getCamera() != null) {
			// NOTE: Some devices will throw errors if you have a camera open when you attempt to open another
			mCamera.getCamera().stopPreview();
			mCamera.getCamera().release();
		}

		// NOTE: The front facing camera needs to be 180 degrees further rotated than the back facing camera
		int rotate = 0;
		if (!mUseBackfacingCamera) {
			updatedCamera = openBackFacingCameraGingerbread();
			rotate = 0;
		}
		else {
			updatedCamera = openFrontFacingCameraGingerbread();
			rotate = 180;
		}

		if(updatedCamera != null) {
			updatedCamera.setDisplayOrientation((mCameraOrientation + rotate) % 360);
			mCamera.setCamera(updatedCamera);
			mCamera.setOrientation(mCameraOrientation);

			updatedCamera.startPreview();
			mUseBackfacingCamera = !mUseBackfacingCamera;
			mStream.updateStreamMeta();
		}

	}

	public void muteAudio () {
		if (mStream != null) {
			mStream.restrainAudio(true);
		}
	}
	public void unmuteAudio () {
		if (mStream != null) {
			mStream.restrainAudio(false);
		}
	}

	public void muteVideo () {
		if (mStream != null) {
			mIsRestrainingVideo = true;
			mStream.restrainVideo(true);
		}
	}
	public void unmuteVideo () {
		if (mStream != null) {
			mIsRestrainingVideo = false;
			mStream.restrainVideo(false);
		}
	}

	protected void doPublish (String streamName, R5Stream.RecordType streamType) {

		Log.d(TAG, "doPublish()");

		Boolean hasPreview = mIsPublisherSetup;
		if (!mIsPublisherSetup) {
			setupPublisher(false);
		}

		Boolean shouldPublishVideo = (mCamera != null && mCamera.getCamera() != null && mUseVideo);

		Log.d(TAG, "Should publish video? " + shouldPublishVideo);
		if (shouldPublishVideo && hasPreview) {
			mCamera.getCamera().stopPreview();
		}

		reorient();
		Log.d(TAG, ">> Publish");
		mStream.publish(streamName, streamType);

		if (shouldPublishVideo) {
			Log.d(TAG, ">> Start Preview");
			mCamera.getCamera().startPreview();
		}

	}

	protected void setupPublisher (Boolean withPreview) {

		R5Camera camera = null;
		// Establish Camera if requested.
		if (mUseVideo) {

			Camera device = mUseBackfacingCamera
					? openBackFacingCameraGingerbread()
					: openFrontFacingCameraGingerbread();

			updateDeviceOrientationOnLayoutChange();
			int rotate = mUseBackfacingCamera ? 0 : 180;
			device.setDisplayOrientation((mCameraOrientation + rotate) % 360);

			camera = new R5Camera(device, mCameraWidth, mCameraHeight);
			camera.setBitrate(mBitrate);
			camera.setOrientation(mCameraOrientation);
			camera.setFramerate(mFramerate);

			mCamera = camera;
			Camera.Parameters params = mCamera.getCamera().getParameters();
			params.setRecordingHint(true);
			mCamera.getCamera().setParameters(params);

		}

		// Assign ABR Controller if requested.
		if (mUseAdaptiveBitrateController) {
			R5AdaptiveBitrateController adaptor = new R5AdaptiveBitrateController();
			adaptor.AttachStream(mStream);
		}
		// Establish Microphone if requested.
		if (mUseAudio) {

			R5Microphone mic = new R5Microphone();
			mStream.attachMic(mic);
			mic.setBitRate(mAudioBitrate);
			mStream.audioController.sampleRate = mAudioSampleRate;
			// e.g., ->
			// This is required to be 8000 in order for 2-Way to work.
//          mStream.audioController.sampleRate = 8000;

		}

		if (mCamera != null && mUseVideo) {
			mStream.attachCamera(mCamera);
			if (mCamera.getCamera() != null && withPreview) {
				mCamera.getCamera().startPreview();
			}
		}

		mIsPublisherSetup = true;

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

	public void reorient() {

		if (mCamera != null) {

			int rotate = mUseBackfacingCamera ? 0 : 180;
			int displayOrientation = (mDisplayOrientation + rotate) % 360;
			mCamera.setOrientation(mCameraOrientation);
			mCamera.getCamera().setDisplayOrientation(displayOrientation);
			mStream.updateStreamMeta();
			Log.d(TAG, "Reorient: rotate(" + rotate + "), displayOrientation(" + displayOrientation + ")");

		}
		mOrientationDirty = false;

	}

	public void updateDeviceOrientationOnLayoutChange() {

		int degrees = 0;
		int rotation = mContext.getCurrentActivity().getWindowManager().getDefaultDisplay().getRotation();

		switch (rotation) {
			case Surface.ROTATION_0: degrees = 0; break;
			case Surface.ROTATION_90: degrees = 270; break;
			case Surface.ROTATION_180: degrees = 180; break;
			case Surface.ROTATION_270: degrees = 90; break;
		}

		mDisplayOrientation = (mOrigCamOrientation + degrees) % 360;
		mCameraOrientation = rotation % 2 != 0 ? mDisplayOrientation - 180 : mDisplayOrientation;
		if (mUseBackfacingCamera && (rotation % 2 != 0)) {
			mCameraOrientation += 180;
		}
		Log.d(TAG, "Reorient: camera(" + mCameraOrientation + "), rotation(" + rotation + ")");
		mOrientationDirty = true;

	}

	protected void applyDeviceRotation () {

		int degrees = 0;
		int rotation = mContext.getCurrentActivity().getWindowManager().getDefaultDisplay().getRotation();

		switch (rotation) {
			case Surface.ROTATION_0: degrees = 0; break;
			case Surface.ROTATION_90: degrees = 90; break;
			case Surface.ROTATION_180: degrees = 180; break;
			case Surface.ROTATION_270: degrees = 270; break;
		}

		mCameraOrientation += degrees;
		mCameraOrientation = mCameraOrientation % 360;
		mOrigCamOrientation = 270;

	}

	protected void applyInverseDeviceRotation(){

		int degrees = 0;
		int rotation = mContext.getCurrentActivity().getWindowManager().getDefaultDisplay().getRotation();

		switch (rotation) {
			case Surface.ROTATION_0: degrees = 0; break;
			case Surface.ROTATION_90: degrees = 270; break;
			case Surface.ROTATION_180: degrees = 180; break;
			case Surface.ROTATION_270: degrees = 90; break;
		}

		mCameraOrientation += degrees;
		mCameraOrientation = mCameraOrientation % 360;
		mOrigCamOrientation = 270;

	}

	protected Camera openFrontFacingCameraGingerbread() {

		int cameraCount = 0;
		Camera cam = null;
		Camera.CameraInfo cameraInfo = new Camera.CameraInfo();
		cameraCount = Camera.getNumberOfCameras();
		for (int camIdx = 0; camIdx < cameraCount; camIdx++) {
			Camera.getCameraInfo(camIdx, cameraInfo);
			if (cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
				try {
					cam = Camera.open(camIdx);
					mCameraOrientation = cameraInfo.orientation;
					applyDeviceRotation();
					break;
				} catch (RuntimeException e) {
					e.printStackTrace();
				}
			}
		}

		return cam;

	}

	protected Camera openBackFacingCameraGingerbread() {

		int cameraCount = 0;
		Camera cam = null;
		Camera.CameraInfo cameraInfo = new Camera.CameraInfo();
		cameraCount = Camera.getNumberOfCameras();
		for (int camIdx = 0; camIdx < cameraCount; camIdx++) {
			Camera.getCameraInfo(camIdx, cameraInfo);
			if (cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_BACK) {
				try {
					cam = Camera.open(camIdx);
					mCameraOrientation = cameraInfo.orientation;
					applyInverseDeviceRotation();
					break;
				} catch (RuntimeException e) {
					e.printStackTrace();
				}
			}
		}

		return cam;

	}

	public void setVideoView (R5VideoView view) {

		Log.d(TAG, "setVideoView(" + mShowDebugView + ")");
		if (mStream != null && mUseVideo) {
			setPublisherDisplayOn(true, false);
			view.showDebugView(mShowDebugView);
			view.attachStream(mStream);
			mStream.updateStreamMeta();
		}

	}

	public void removeVideoView (R5VideoView view) {

		Log.d(TAG, "removeVideoView()");
		if (mStream != null) {
			setPublisherDisplayOn(false, false);
			view.showDebugView(false);
			view.attachStream(null);
			mStream.updateStreamMeta();
		}

	}

	protected void setPublisherDisplayOn (Boolean setOn, Boolean useService) {

		Log.d(TAG, "setPublisherDisplayOn(" + setOn + ")");
		if (!setOn) {
			if (mStream != null) {
				Log.d(TAG, "Stream:restraingVideo()");
				mStream.restrainVideo(true);
			}
			if (mCamera != null && mCamera.getCamera() != null) {
				Log.d(TAG, "Camera:stop()");
				try {
					Camera c = mCamera.getCamera();
					c.stopPreview();
					c.release();
					mCamera.setCamera(null);
				} catch (Exception e) {
					Log.w(TAG, "Camera:stop:error - " + e.getMessage());
				}
			}
		} else if (mCamera != null && mStream != null && !mIsRestrainingVideo) {
			Log.d(TAG, "setPublisherDisplayOn:reset()");
			int rotate = mUseBackfacingCamera ? 0 : 180;
			int displayOrientation = (mDisplayOrientation + rotate) % 360;
			Camera device = mUseBackfacingCamera
					? openBackFacingCameraGingerbread()
					: openFrontFacingCameraGingerbread();
			device.setDisplayOrientation(displayOrientation);

			mCamera.setCamera(device);
			mCamera.setOrientation(mCameraOrientation);

			mStream.restrainVideo(false);
			mStream.updateStreamMeta();
			device.startPreview();
		} else {
			Log.d(TAG, "setPublisherDisplayOn:bypassed");
		}

		if (mBackgroundPublishService != null) {
			mBackgroundPublishService.setDisplayOn(setOn);
		}

	}

	protected void sendToBackground () {

		Log.d(TAG, "sendToBackground(" + mEnableBackgroundStreaming + ")");
		if (!mEnableBackgroundStreaming) {
			Log.d(TAG, "sendToBackground:shutdown");
			this.unpublish();
			return;
		}

		if (mEnableBackgroundStreaming) {
			Log.d(TAG, "sendToBackground:publisherPause");
			this.setPublisherDisplayOn(false, true);
		}

	}

	protected void bringToForeground () {

		Log.d(TAG, "bringToForeground()");
		if (mEnableBackgroundStreaming) {
			Log.d(TAG, "sendToBackground:publiserResume");
			this.setPublisherDisplayOn(true, true);
		}

	}

	protected void emitEvent (String type, WritableMap map) {

		if (mEventEmitter != null) {
			Log.d(TAG, "Dispatch using Event emitter.");
			mEventEmitter.receiveEvent(this.getEmitterId(), type, map);
		} else {
			Log.d(TAG, "Dispatch using Device emitter.");
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
		this.emitEvent(R5VideoViewLayout.Events.PUBLISHER_STATUS.toString(), map);

		if (event == R5ConnectionEvent.START_STREAMING) {
			mIsStreaming = true;
		}
		else if (event == R5ConnectionEvent.DISCONNECTED && mIsStreaming) {
			WritableMap evt = new WritableNativeMap();
			this.emitEvent(R5VideoViewLayout.Events.UNPUBLISH_NOTIFICATION.toString(), evt);
			Log.d(TAG, "DISCONNECT");
			cleanup();
			mIsStreaming = false;
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
		if (mPubishIntent != null && mIsBackgroundBound) {
			this.setPublisherDisplayOn(false, true);
			activity.unbindService(mPublishServiceConnection);
			activity.stopService(mPubishIntent);
			mIsBackgroundBound = false;
		}
	}

}
