package com.red5pro.reactnative.view;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.res.Configuration;
import android.graphics.Color;
import android.hardware.Camera;
import android.os.IBinder;
import android.util.Log;
import android.view.Surface;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.util.DisplayMetrics;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import com.red5pro.reactnative.module.R5StreamItem;
import com.red5pro.reactnative.stream.R5StreamInstance;
import com.red5pro.reactnative.stream.R5StreamSubscriber;
import com.red5pro.streaming.R5Connection;
import com.red5pro.streaming.R5Stream;
import com.red5pro.streaming.config.R5Configuration;
import com.red5pro.streaming.event.R5ConnectionEvent;
import com.red5pro.streaming.event.R5ConnectionListener;
import com.red5pro.streaming.media.R5AudioController;
import com.red5pro.streaming.source.R5AdaptiveBitrateController;
import com.red5pro.streaming.source.R5Camera;
import com.red5pro.streaming.source.R5Microphone;
import com.red5pro.streaming.view.R5VideoView;

public class R5VideoViewLayout extends FrameLayout
        implements R5ConnectionListener, LifecycleEventListener,
        PublishService.PublishServicable {

    private final static String TAG = "R5VideoViewLayout";

    public int logLevel = 3;
    public int scaleMode = 0;
    public boolean showDebug;

    protected R5StreamInstance mStreamInstance;

    protected String mStreamName;
    protected R5Stream.RecordType mStreamType;
    protected boolean mIsPublisher;
    protected boolean mIsStreaming;
    protected R5VideoView mVideoView;
    protected boolean mIsPublisherSetup;

    protected ThemedReactContext mContext;
    protected RCTEventEmitter mEventEmitter;
    protected R5Configuration mConfiguration;
    protected String mConfigurationKey;
    protected R5Connection mConnection;
    protected R5Stream mStream;
    protected R5Camera mCamera;

    protected boolean mAttached;

    protected boolean mIsRestrainingVideo;
    protected boolean mIsBackgroundBound;

    protected PublishService mBackgroundPublishService;
    private Intent mPubishIntent;

    private ServiceConnection mPublishServiceConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            Log.d(TAG, "connection:onServiceConnected()");
            mBackgroundPublishService = ((PublishService.PublishServiceBinder)service).getService();
            mBackgroundPublishService.setServicableDelegate(R5VideoViewLayout.this);
        }
        @Override
        public void onServiceDisconnected(ComponentName name) {
            Log.d(TAG, "connection:onServiceDisconnected()");
            mBackgroundPublishService = null;
        }
    };

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

    protected int mCameraOrientation;
    protected int mDisplayOrientation;
    protected boolean mOrientationDirty;
    protected int mOrigCamOrientation = 0;
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

    public void removeStreamInstance () {

        if (mStreamInstance != null) {
            mStreamInstance.setEmitterId(-1);
            mStreamInstance = null;
        }

    }

    public void setStreamInstance (R5StreamInstance instance) {

        Log.d(TAG, "setStreamInstance()");
        mStreamInstance = instance;
        if (instance != null) {
            mStreamInstance.setEmitterId(this.getId());
        }

    }

    public void subscribe (String streamName) {

        Log.d(TAG, "subscribe()");

        if (mStreamInstance != null && mStreamInstance instanceof R5StreamSubscriber) {

            this.getConfiguration().setStreamName(streamName);
            ((R5StreamSubscriber) mStreamInstance).subscribe(this.getConfiguration(),
                    mPlaybackVideo,
                    mEnableBackgroundStreaming,
                    mAudioMode, logLevel, scaleMode, showDebug);

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


    public void setPlaybackVolume (float value) {

        Log.d(TAG, "setPlaybackVolume(" + value + ")");
        if (mStreamInstance != null && mStreamInstance instanceof R5StreamSubscriber) {
            ((R5StreamSubscriber) mStreamInstance).setPlaybackVolume(value);
        }

    }

    public void setupPublisher (Boolean withPreview) {

        mIsPublisher = true;
        if (mLayoutListener == null) {
            mLayoutListener = setUpOrientationListener();
        }

        R5Camera camera = null;
        // Establish Camera if requested.
        if (mUseVideo) {

            if (this.getVideoView() == null) {
                mVideoView = getOrCreateVideoView();
                if (mRequiresScaleSizeUpdate) {
                    this.updateScaleSize(mClientWidth, mClientHeight, mClientScreenWidth, mClientScreenHeight);
                }
            }

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

        if (mVideoView != null && mUseVideo) {
            mVideoView.attachStream(mStream);
        }
        if (mCamera != null && mUseVideo) {
            mStream.attachCamera(mCamera);
            if (mCamera.getCamera() != null && withPreview) {
              mCamera.getCamera().startPreview();
            }
        }

        mIsPublisherSetup = true;
    }

    private void detectToStartService (Intent intent, ServiceConnection connection) {
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

    private void doPublish (String streamName, R5Stream.RecordType streamType) {

        Log.d(TAG, "doPublish()");
        Boolean hasPreview = mIsPublisherSetup;
        if (!mIsPublisherSetup) {
            setupPublisher(false);
        }

        mIsPublisher = true;

        if (this.getVideoView() != null) {
            mVideoView.showDebugView(this.showDebug);
        }

        Boolean shouldPublishVideo = (mCamera != null && mCamera.getCamera() != null && mUseVideo);

        if (shouldPublishVideo && hasPreview) {
            mCamera.getCamera().stopPreview();
        }

        reorient();
        mStream.publish(streamName, streamType);

        if (shouldPublishVideo) {
            if (mRequiresScaleSizeUpdate) {
                this.updateScaleSize(mClientWidth, mClientHeight, mClientScreenWidth, mClientScreenHeight);
            }
            mCamera.getCamera().startPreview();
        }

    }

    public void publishBound () {

        Log.d(TAG, "doPublishBound()");
        doPublish(mStreamName, mStreamType);

    }

    public void publish (String streamName, R5Stream.RecordType streamType) {

        Log.d(TAG, "publish()");

        mStreamName = streamName;
        mStreamType = streamType;

        if (mStream == null) {
            Log.d("R5VideoViewLayout", "publisher re-establishing connection.");
//            establishConnection(mConfiguration);
        }

        if (mEnableBackgroundStreaming) {
            Log.d("R5VideoViewLayout", "setting up bound publisher for background streaming.");
            // Set up service and offload setup.
            mPubishIntent = new Intent(mContext.getCurrentActivity(), PublishService.class);
            detectToStartService(mPubishIntent, mPublishServiceConnection);
            return;
        }

        doPublish(mStreamName, mStreamType);

    }

    public void unpublish () {

        Log.d(TAG, "unpublish()");

        if (mVideoView != null) {
            mVideoView.attachStream(null);
        }

        if (mCamera != null) {
            try {
                Camera c = mCamera.getCamera();
                c.stopPreview();
                c.release();
            } catch (Exception e) {
                Log.w("R5VideoViewLayout", "unpublish:stop:error  " + e.getMessage());
            }
            mCamera = null;
        }

        if (mStream != null && mIsStreaming) {
            mStream.stop();
        }
        else {
            WritableMap map = Arguments.createMap();
            mEventEmitter.receiveEvent(this.getId(), Events.UNPUBLISH_NOTIFICATION.toString(), map);
            Log.d(TAG, "UNPUBLISH");
            cleanup();
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
        if (!mIsPublisher) {
            if (mStreamInstance != null) {
                mStreamInstance.removeVideoView(this.getVideoView());
            }
        } else {
            // TODO: Publisher?
        }

    }

    public void swapCamera () {

        if (!mIsPublisher) {
            return;
        }

        Camera updatedCamera;

        // NOTE: Some devices will throw errors if you have a camera open when you attempt to open another
        mCamera.getCamera().stopPreview();
        mCamera.getCamera().release();

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

    public void muteAudio () {
        if (mIsPublisher) {
            mStream.restrainAudio(true);
        }
    }
    public void unmuteAudio () {
        if (mIsPublisher) {
            mStream.restrainAudio(false);
        }
    }

    public void muteVideo () {
        if (mIsPublisher) {
            mIsRestrainingVideo = true;
            mStream.restrainVideo(true);
        }
    }
    public void unmuteVideo () {
        if (mIsPublisher) {
            mIsRestrainingVideo = false;
            mStream.restrainVideo(false);
        }
    }



    protected void cleanup() {

        Log.d(TAG, ":cleanup (" + mStreamName + ")!");
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

        if (mVideoView != null) {
            mVideoView.attachStream(null);
//            mVideoView = null;
        }

        mIsStreaming = false;
        mIsPublisherSetup = false;
        mIsRestrainingVideo = false;

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

    protected void setPublisherDisplayOn (Boolean setOn) {

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

    protected void reorient() {

        if (mCamera != null) {
            int rotate = mUseBackfacingCamera ? 0 : 180;
            int displayOrientation = (mDisplayOrientation + rotate) % 360;
            mCamera.setOrientation(mCameraOrientation);
            mCamera.getCamera().setDisplayOrientation(displayOrientation);
            mStream.updateStreamMeta();
        }
        mOrientationDirty = false;

    }

    protected void updateDeviceOrientationOnLayoutChange() {

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
        mOrigCamOrientation = 90;

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

    protected void setSubscriberDisplayOn (Boolean setOn) {

//        Log.d("R5VideoViewLayout", "setSubscriberDisplayOn(" + setOn + ")");
//        if (!setOn) {
//            if (mStream != null) {
//                Log.d("R5VideoViewLayout", "Stream:deactivate_display()");
//                mStream.deactivate_display();
//            }
//        } else if (mStream != null) {
//            Log.d("R5VideoViewLayout", "Stream:activate_display()");
//            mStream.activate_display();
//
//        }
//
//        if (mBackgroundSubscribeService != null) {
//            mBackgroundSubscribeService.setDisplayOn(setOn);
//        }

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
        if (!mEnableBackgroundStreaming) {
            Log.d("R5VideoViewLayout", "sendToBackground:shutdown");
            if (mIsPublisher) {
                this.unpublish();
            } else {
//                this.unsubscribe();
            }
            return;
        }

        if (mIsPublisher && mEnableBackgroundStreaming) {
            Log.d("R5VideoViewLayout", "sendToBackground:publiserPause");
            this.setPublisherDisplayOn(false);
        } else if (mIsStreaming && mEnableBackgroundStreaming) {
            Log.d("R5VideoViewLayout", "sendToBackground:subscriberPause");
//            this.setSubscriberDisplayOn(false);
        }

    }

    public void bringToForeground () {

        Log.d(TAG, "bringToForeground()");
        if (mIsPublisher && mEnableBackgroundStreaming) {
            Log.d(TAG, "sendToBackground:publiserResume");
            this.setPublisherDisplayOn(true);
        } else if (mIsStreaming && mEnableBackgroundStreaming) {
            Log.d(TAG, "sendToBackground:publiserResume");
//            this.setSubscriberDisplayOn(true);
        }

    }

    public void onMetaData(String metadata) {

        String[] props = metadata.split(";");
        for (String s : props) {
            String[] kv = s.split("=");
            if (kv[0].equalsIgnoreCase("orientation")) {
                updateOrientation(Integer.parseInt(kv[1]));
            }
        }
        WritableMap map = new WritableNativeMap();
        map.putString("metadata", metadata);
        mEventEmitter.receiveEvent(this.getId(), Events.METADATA.toString(), map);

    }

    @Override
    public void onConnectionEvent(R5ConnectionEvent event) {

        Log.d(TAG, ":onConnectionEvent " + event.name());
        WritableMap map = new WritableNativeMap();
        WritableMap statusMap = new WritableNativeMap();
        statusMap.putInt("code", event.value());
        statusMap.putString("message", event.message);
        statusMap.putString("name", event.name());
        statusMap.putString("streamName", mStreamName);
        map.putMap("status", statusMap);
        if (mIsPublisher) {
            mEventEmitter.receiveEvent(this.getId(), Events.PUBLISHER_STATUS.toString(), map);
        }
        else {
            mEventEmitter.receiveEvent(this.getId(), Events.SUBSCRIBER_STATUS.toString(), map);
        }

        if (event == R5ConnectionEvent.START_STREAMING) {
            mIsStreaming = true;
        }
        else if (event == R5ConnectionEvent.DISCONNECTED && mIsStreaming) {
            WritableMap evt = new WritableNativeMap();
            if (mIsPublisher) {
                mEventEmitter.receiveEvent(this.getId(), Events.UNPUBLISH_NOTIFICATION.toString(), evt);
            }
            else {
                mEventEmitter.receiveEvent(this.getId(), Events.UNSUBSCRIBE_NOTIFICATION.toString(), evt);
            }
            Log.d("R5VideoViewLayout", "DISCONNECT");
            cleanup();
            mIsStreaming = false;
        }

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

        Activity activity = mContext.getCurrentActivity();
        if (mPubishIntent != null && mIsBackgroundBound) {
            this.setPublisherDisplayOn(false);
            activity.unbindService(mPublishServiceConnection);
            activity.stopService(mPubishIntent);
            mIsBackgroundBound = false;
        }
//        else if (mSubscribeIntent != null && mIsBackgroundBound) {
//            this.setSubscriberDisplayOn(false);
//            activity.unbindService(mSubscribeServiceConnection);
//            activity.stopService(mSubscribeIntent);
//            mIsBackgroundBound = false;
//        }
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
        this.showDebug = show;
        if (this.getVideoView() != null) {
            this.getVideoView().showDebugView(this.showDebug);
        }
    }

    public void updateScaleMode(int mode) {
        this.scaleMode = mode;
        if (mStreamInstance != null && mStreamInstance instanceof R5StreamSubscriber) {
            ((R5StreamSubscriber) mStreamInstance).updateScaleMode(mode);
        }
    }

    public void updateLogLevel(int level) {
        this.logLevel = level;
        if (mStreamInstance != null && mStreamInstance instanceof R5StreamSubscriber) {
            ((R5StreamSubscriber) mStreamInstance).updateLogLevel(level);
        }
    }

    public void updatePublishVideo(boolean useVideo) {
        this.mUseVideo = useVideo;
    }

    public void updatePublishAudio(boolean useAudio) {
        this.mUseAudio = useAudio;
    }

    public void updateSubscribeVideo(boolean playbackVideo) {
        this.mPlaybackVideo = playbackVideo;
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

    public R5Stream getStream() {
        return mStream;
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
            mVideoView.showDebugView(this.showDebug);
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
