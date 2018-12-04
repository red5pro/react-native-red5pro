package com.red5pro.reactnative.view;

import android.app.Activity;
import android.content.res.Configuration;
import android.graphics.Color;
import android.hardware.Camera;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.util.DisplayMetrics;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import com.red5pro.reactnative.stream.R5StreamInstance;
import com.red5pro.reactnative.stream.R5StreamProps;
import com.red5pro.reactnative.stream.R5StreamPublisher;
import com.red5pro.reactnative.stream.R5StreamSubscriber;
import com.red5pro.streaming.R5Stream;
import com.red5pro.streaming.config.R5Configuration;
import com.red5pro.streaming.view.R5VideoView;

public class R5VideoViewLayout extends FrameLayout
        implements LifecycleEventListener {

    private final static String TAG = "R5VideoViewLayout";

    public int mLogLevel = 3;
    public int mScaleMode = 0;
    public boolean mShowDebug;

    protected R5StreamInstance mStreamInstance;

    protected String mStreamName;
    protected R5VideoView mVideoView;

    protected ThemedReactContext mContext;
    protected RCTEventEmitter mEventEmitter;
    protected R5Configuration mConfiguration;
    protected String mConfigurationKey;

    protected boolean mAttached;

    protected boolean mUseVideo = true;
    protected boolean mUseAudio = true;
    protected boolean mPlaybackVideo = true;
    protected int mCameraWidth = 640;
    protected int mCameraHeight = 360;
    protected int mBitrate = 750;
    protected int mFramerate = 15;
    protected int mAudioMode = 0;
    protected int mAudioBitrate = 32;
    protected int mAudioSampleRate = 44100;
    protected boolean mUseAdaptiveBitrateController = false;
    protected boolean mUseBackfacingCamera = false;
    protected boolean mEnableBackgroundStreaming = false;
    protected boolean mZOrderOnTop = false;
    protected boolean mZOrderMediaOverlay = false;

    protected int mClientWidth;
    protected int mClientHeight;
    protected int mClientScreenWidth;
    protected int mClientScreenHeight;
    protected boolean mRequiresScaleSizeUpdate = false;

    protected boolean mOrientationDirty;
    protected View.OnLayoutChangeListener mLayoutListener;

    public enum Events {

        CONFIGURED("onConfigured"),
        METADATA("onMetaDataEvent"),
        PUBLISHER_STATUS("onPublisherStreamStatus"),
        SUBSCRIBER_STATUS("onSubscriberStreamStatus"),
        UNPUBLISH_NOTIFICATION("onUnpublishNotification"),
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

    public enum Commands {

        SUBSCRIBE("subscribe", 1),
        PUBLISH("publish", 2),
        UNSUBSCRIBE("unsubscribe", 3),
        UNPUBLISH("unpublish", 4),
        SWAP_CAMERA("swapCamera", 5),
        UPDATE_SCALE_MODE("updateScaleMode", 6),
        UPDATE_SCALE_SIZE("updateScaleSize", 7),
        MUTE_AUDIO("muteAudio", 8),
        UNMUTE_AUDIO("unmuteAudio", 9),
        MUTE_VIDEO("muteVideo", 10),
        UNMUTE_VIDEO("unmuteVideo", 11),
        SET_PLAYBACK_VOLUME("setPlaybackVolume", 12),
        DETACH("detach", 13),
        ATTACH("attach", 14);

        private final String mName;
        private final int mValue;

        Commands(final  String name, final int value) {
            mName = name;
            mValue = value;
        }

        public final int getValue() {
            return mValue;
        }

        @Override
        public String toString() {
            return mName;
        }

    }

    R5VideoViewLayout(ThemedReactContext context) {

        super(context);

        Log.d(TAG, "new()");

        mContext = context;
        mEventEmitter = mContext.getJSModule(RCTEventEmitter.class);
        setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        mContext.addLifecycleEventListener(this);

    }

    public R5Configuration getConfiguration() {
        return mConfiguration;
    }

    public R5StreamInstance getStreamInstance () {
        return mStreamInstance;
    }

    public void setStreamInstance (R5StreamInstance instance) {

        Log.d(TAG, "setStreamInstance()");
        mStreamInstance = instance;
        if (instance != null) {
            mStreamInstance.setEmitterId(this.getId());
        }

    }

    public void removeStreamInstance () {

        if (mStreamInstance != null) {
            mStreamInstance.setEmitterId(-1);
            mStreamInstance = null;
        }

    }

    public void subscribe (String streamName) {

        Log.d(TAG, "subscribe()");

        if (mStreamInstance != null && mStreamInstance instanceof R5StreamSubscriber) {

            this.getConfiguration().setStreamName(streamName);
            ((R5StreamSubscriber) mStreamInstance).subscribe(this.getConfiguration(), getSubscriberProps());
            if (mAttached) {
                this.attach();
            }

        } else {
            Log.d(TAG, "Stream Instance not available for subscription!");
        }

    }

    public void unsubscribe () {

        Log.d(TAG, "unsubscribe()");
        if (mStreamInstance != null && mStreamInstance instanceof R5StreamSubscriber) {
            ((R5StreamSubscriber) mStreamInstance).unsubscribe();
        }

    }

    public void publish (String streamName, R5Stream.RecordType streamType) {

        Log.d(TAG, "publish()");

        if (mStreamInstance != null && mStreamInstance instanceof R5StreamPublisher) {

            this.getConfiguration().setStreamName(streamName);
            ((R5StreamPublisher) mStreamInstance).publish(this.getConfiguration(),
                    streamType, getPublisherProps());

            if (mAttached) {
                this.attach();
            }

            if (mRequiresScaleSizeUpdate) {
                this.updateScaleSize(mClientWidth, mClientHeight, mClientScreenWidth, mClientScreenHeight);
            }

        } else {
            Log.d(TAG, "Stream Instance not available for subscription!");
        }

    }

    public void unpublish () {

        Log.d(TAG, "unpublish()");
        if (mStreamInstance != null && mStreamInstance instanceof R5StreamPublisher) {
            ((R5StreamPublisher) mStreamInstance).unpublish();
        }

    }

    public void attach () {

        if (mStreamInstance != null) {
            mAttached = true;
            mVideoView = getOrCreateVideoView();
            mStreamInstance.setVideoView(mVideoView);
        }

    }

    public void detach () {

        mAttached = false;
        if (mStreamInstance != null) {
            mStreamInstance.removeVideoView(this.getVideoView());
        }

    }

    public void setPlaybackVolume (float value) {

        Log.d(TAG, "setPlaybackVolume(" + value + ")");
        if (mStreamInstance != null && mStreamInstance instanceof R5StreamSubscriber) {
            ((R5StreamSubscriber) mStreamInstance).setPlaybackVolume(value);
        }

    }

    public void swapCamera () {

        Log.d(TAG, "swapCamera()");
        if (mStreamInstance != null && mStreamInstance instanceof R5StreamPublisher) {
            ((R5StreamPublisher) mStreamInstance).swapCamera();
        }

    }

    public void muteAudio () {
        if (mStreamInstance != null && mStreamInstance instanceof R5StreamPublisher) {
            ((R5StreamPublisher) mStreamInstance).muteAudio();
        }
    }
    public void unmuteAudio () {
        if (mStreamInstance != null && mStreamInstance instanceof R5StreamPublisher) {
            ((R5StreamPublisher) mStreamInstance).unmuteAudio();
        }
    }

    public void muteVideo () {
        if (mStreamInstance != null && mStreamInstance instanceof R5StreamPublisher) {
            ((R5StreamPublisher) mStreamInstance).muteVideo();
        }
    }
    public void unmuteVideo () {
        if (mStreamInstance != null && mStreamInstance instanceof R5StreamPublisher) {
            ((R5StreamPublisher) mStreamInstance).unmuteVideo();
        }
    }

    public void updateScaleSize(final int width, final int height, final int screenWidth, final int screenHeight) {

        mClientWidth = width;
        mClientHeight = height;
        mClientScreenWidth = screenWidth;
        mClientScreenHeight = screenHeight;
        mRequiresScaleSizeUpdate = true;

        if (this.getVideoView() != null) {

            Log.d(TAG, "rescaling...");

            final float xscale = (float)width / (float)screenWidth;
            final float yscale = (float)height / (float)screenHeight;

            final FrameLayout layout = mVideoView;
            final DisplayMetrics displayMetrics = new DisplayMetrics();
            mContext.getCurrentActivity().getWindowManager()
                    .getDefaultDisplay()
                    .getMetrics(displayMetrics);

            final int dwidth = displayMetrics.widthPixels;
            final int dheight = displayMetrics.heightPixels;

            layout.post(new Runnable() {
                @Override
                public void run() {
                    ViewGroup.LayoutParams params = (ViewGroup.LayoutParams) layout.getLayoutParams();
                    params.width = Math.round((displayMetrics.widthPixels * 1.0f) * xscale);
                    params.height = Math.round((displayMetrics.heightPixels * 1.0f) * yscale);
                    layout.setLayoutParams(params);
                }
            });

        }

    }

    protected View.OnLayoutChangeListener setUpOrientationListener() {
        return new View.OnLayoutChangeListener() {
            @Override
            public void onLayoutChange(View v, int left, int top, int right, int bottom, int oldLeft,
                                       int oldTop, int oldRight, int oldBottom) {
                if (mOrientationDirty) {
                    reorient();
                }
            }
        };
    }

    protected R5StreamProps getSubscriberProps () {

        R5StreamProps props = new R5StreamProps();
        props.logLevel = mLogLevel;
        props.audioMode = mAudioMode;
        props.scaleMode = mScaleMode;
        props.showDebugView = mShowDebug;
        props.subscribeVideo = mPlaybackVideo;
        props.enableBackgroundStreaming = mEnableBackgroundStreaming;
        return props;

    }

    protected R5StreamProps getPublisherProps () {

        R5StreamProps props = new R5StreamProps();
        props.logLevel = mLogLevel;
        props.audioMode = mAudioMode;
        props.scaleMode = mScaleMode;
        props.showDebugView = mShowDebug;
        props.publishVideo = mUseVideo;
        props.publishAudio = mUseAudio;
        props.cameraWidth = mCameraWidth;
        props.cameraHeight = mCameraHeight;
        props.bitrate = mBitrate;
        props.framerate = mFramerate;
        props.audioBitrate = mAudioBitrate;
        props.audioSampleRate = mAudioSampleRate;
        props.useBackfacingCamera = mUseBackfacingCamera;
        props.enableBackgroundStreaming = mEnableBackgroundStreaming;
        props.useAdaptiveBitrateController = mUseAdaptiveBitrateController;
        return props;

    }

    protected void reorient() {

        if (mStreamInstance != null && mStreamInstance instanceof R5StreamPublisher) {
            ((R5StreamPublisher) mStreamInstance).reorient();
        }
        mOrientationDirty = false;

    }

    protected void updateDeviceOrientationOnLayoutChange() {

        if (mStreamInstance != null && mStreamInstance instanceof R5StreamPublisher) {
            ((R5StreamPublisher) mStreamInstance).updateDeviceOrientationOnLayoutChange();
        }
        mOrientationDirty = true;

    }

    protected void onConfigured(String key) {

        Log.d(TAG, "onConfigured()");
        WritableMap map = new WritableNativeMap();
        map.putString("key", key);
        mEventEmitter.receiveEvent(this.getId(), "onConfigured", map);
    }

    protected void updateOrientation(int value) {
        // subscriber only.
        value += 90;
        if (this.getVideoView() != null) {
            this.getVideoView().setStreamRotation(value);
        }
    }

    public void sendToBackground () {

        Log.d(TAG, "sendToBackground()");

    }

    public void bringToForeground () {

        Log.d(TAG, "bringToForeground()");

    }

    @Override
    public void onHostResume() {
        Activity activity = mContext.getCurrentActivity();
        if (mLayoutListener == null) {
            mLayoutListener = setUpOrientationListener();
        }
        this.addOnLayoutChangeListener(mLayoutListener);

        Log.d(TAG, "onHostResume()");
        bringToForeground();
    }

    @Override
    public void onHostPause() {
        if (mLayoutListener != null) {
            this.removeOnLayoutChangeListener(mLayoutListener);
        }
        Log.d(TAG, "onHostPause()");
        sendToBackground();
    }

    @Override
    public void onHostDestroy() {
        Log.d(TAG, "onHostDestroy()");
        // TODO: Needed ?
        this.removeStreamInstance();
    }

    @Override
    public void onConfigurationChanged(Configuration config) {

        updateDeviceOrientationOnLayoutChange();

    }

    @Deprecated
    public void updateConfiguration(final R5Configuration configuration, final String forKey) {

        Log.d(TAG, "updateConfiguration()");
        mConfiguration = configuration;
        mConfigurationKey = forKey;
        mAttached = true;
        onConfigured(forKey);

    }

    public void updateConfiguration(final R5Configuration configuration,
                                    final String forKey,
                                    boolean autoAttachView) {

        Log.d(TAG, "updateConfiguration_withAutoConnectOption()");
        mConfiguration = configuration;
        mConfigurationKey = forKey;
        mAttached = autoAttachView;
        onConfigured(forKey);

    }

    public void updateShowDebug(boolean show) {
        this.mShowDebug = show;
        if (this.getVideoView() != null) {
            this.getVideoView().showDebugView(this.mShowDebug);
        }
    }

    public void updateScaleMode(int mode) {
        this.mScaleMode = mode;
        if (mStreamInstance != null) {
            mStreamInstance.updateScaleMode(mode);
        }
    }

    public void updateLogLevel(int level) {
        this.mLogLevel = level;
        if (mStreamInstance != null) {
            mStreamInstance.updateLogLevel(level);
        }
    }

    public void updateSubscribeVideo(boolean playbackVideo) {
        this.mPlaybackVideo = playbackVideo;
    }

    public void updatePublishVideo(boolean useVideo) {
        this.mUseVideo = useVideo;
    }

    public void updatePublishAudio(boolean useAudio) {
        this.mUseAudio = useAudio;
    }

    public void updateCameraWidth(int value) {
        this.mCameraWidth = value;
    }

    public void updateCameraHeight(int value) {
        this.mCameraHeight = value;
    }

    public void updatePublishBitrate(int value) {
        this.mBitrate = value;
    }

    public void updatePublishFramerate(int value) {
        this.mFramerate = value;
    }

    public void updateSubscriberAudioMode(int value) {
        this.mAudioMode = value;
    }

    public void updatePublishAudioBitrate(int value) {
        this.mAudioBitrate = value;
    }

    public void updatePublishAudioSampleRate(int value) {
        this.mAudioSampleRate = value;
    }

    public void updatePublisherUseAdaptiveBitrateController(boolean value) {
        this.mUseAdaptiveBitrateController = value;
    }

    public void updatePublisherUseBackfacingCamera(boolean value) {
        this.mUseBackfacingCamera = value;
    }

    public void updatePubSubBackgroundStreaming(boolean value) {
        this.mEnableBackgroundStreaming = value;
    }

    public void updateZOrderOnTop(boolean value) {
        this.mZOrderOnTop = value;
    }

    public void updateZOrderMediaOverlay(boolean value) {
        this.mZOrderMediaOverlay = value;
    }

    public String getStreamName() {
        return mStreamName;
    }

    public R5VideoView getVideoView() {
        return mVideoView;
    }

    public R5VideoView getOrCreateVideoView () {

        Log.d("R5VideoViewLayout", "getOrCreateVideoView()");
        if (mVideoView == null) {

            mVideoView = new R5VideoView(mContext);
            mVideoView.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
            mVideoView.setBackgroundColor(Color.BLACK);
            if (mZOrderOnTop) {
                mVideoView.setZOrderOnTop(mZOrderOnTop);
            }
            if (mZOrderMediaOverlay) {
                mVideoView.setZOrderMediaOverlay(mZOrderMediaOverlay);
            }
            mVideoView.showDebugView(this.mShowDebug);
            addView(mVideoView);

        }

        return mVideoView;

    }

    /*
     * [Red5Pro]
     *
     * Start silly hack of enforcing layout of underlying GLSurface for view.
     */
    @Override
    public void requestLayout() {
        super.requestLayout();
        post(measureAndLayout);
    }

    private final Runnable measureAndLayout = new Runnable() {
        @Override
        public void run() {
            measure(
                    MeasureSpec.makeMeasureSpec(getWidth(), MeasureSpec.EXACTLY),
                    MeasureSpec.makeMeasureSpec(getHeight(), MeasureSpec.EXACTLY));
            layout(getLeft(), getTop(), getRight(), getBottom());
            if (mOrientationDirty) {
                reorient();
            }
        }
    };
    /*
     * [/Red5Pro]
     */

}
