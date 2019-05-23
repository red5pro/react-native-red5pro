package com.red5pro.reactnative.view;

import android.util.Log;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.annotations.ReactProp;

import com.red5pro.reactnative.module.R5StreamModule;
import com.red5pro.reactnative.stream.R5StreamInstance;
import com.red5pro.reactnative.stream.R5StreamMapManager;
import com.red5pro.reactnative.stream.R5StreamPublisher;
import com.red5pro.reactnative.stream.R5StreamSubscriber;
import com.red5pro.reactnative.util.RecordTypeUtil;
import com.red5pro.streaming.R5Stream;
import com.red5pro.streaming.R5StreamProtocol;
import com.red5pro.streaming.config.R5Configuration;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

public class R5VideoViewManager extends SimpleViewManager<R5VideoViewLayout> implements
        R5StreamMapManager {

    private static final String TAG = "R5VideoViewManager";
    private static final String REACT_CLASS = "R5VideoView";

    private static final String PROP_HOST = "host";
    private static final String PROP_PORT = "port";
    private static final String PROP_CONTEXT_NAME = "contextName";
    private static final String PROP_STREAM_NAME = "streamName";
    private static final String PROP_BUFFER_TIME = "bufferTime";
    private static final String PROP_LICENSE_KEY = "licenseKey";
    private static final String PROP_BUNDLE_ID = "bundleID";
    private static final String PROP_PARAMETERS = "parameters";
    private static final String PROP_STREAM_BUFFER_TIME = "streamBufferTime";

    private static final int COMMAND_SUBSCRIBE = 1;
    private static final int COMMAND_PUBLISH = 2;
    private static final int COMMAND_UNSUBSCRIBE = 3;
    private static final int COMMAND_UNPUBLISH = 4;
    private static final int COMMAND_SWAP_CAMERA = 5;
    private static final int COMMAND_UPDATE_SCALE_MODE = 6;
    private static final int COMMAND_UPDATE_SCALE_SIZE = 7;
    private static final int COMMAND_MUTE_AUDIO = 8;
    private static final int COMMAND_UNMUTE_AUDIO = 9;
    private static final int COMMAND_MUTE_VIDEO = 10;
    private static final int COMMAND_UNMUTE_VIDEO = 11;
    private static final int COMMAND_SET_PLAYBACK_VOLUME = 12;
    private static final int COMMAND_DETACH = 13;
    private static final int COMMAND_ATTACH = 14;

    protected Map<String, R5StreamInstance> streamMap;

    public boolean addManagedStream (String name, R5StreamInstance item) {
        if (!streamMap.containsKey(name)) {
            streamMap.put(name, item);
            return true;
        }
        return false;
    }
    public boolean removeManagedStream (String name) {
        if (streamMap.containsKey(name)) {
            streamMap.remove(name);
            return true;
        }
        return false;
    }

    private R5VideoViewLayout mView;
    private ThemedReactContext mContext;
    private R5StreamModule mStreamModule;

    public void setModuleManager(R5StreamModule streamModule) {
        Log.d(TAG, "setModuleManager(): " + (streamModule == null));
        this.mStreamModule = streamModule;
    }

    public R5VideoViewManager(R5StreamModule streamModule) {
        super();
        Log.d(TAG, "got stream module: " + (streamModule == null));
        mStreamModule = streamModule;
        streamMap = new HashMap<>();
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected R5VideoViewLayout createViewInstance(ThemedReactContext reactContext) {

        mContext = reactContext;
        mView = new R5VideoViewLayout(reactContext);
        return mView;

    }

    protected R5Configuration genereateConfiguration(ReadableMap configuration) {

        boolean hasHost = configuration.hasKey(PROP_HOST);
        boolean hasPort = configuration.hasKey(PROP_PORT);
        boolean hasContextName = configuration.hasKey(PROP_CONTEXT_NAME);
        boolean hasStreamName = configuration.hasKey(PROP_STREAM_NAME);
        boolean hasBufferTime = configuration.hasKey(PROP_BUFFER_TIME);
        boolean hasStreamBufferTime = configuration.hasKey(PROP_STREAM_BUFFER_TIME);
        boolean hasBundleID = configuration.hasKey(PROP_BUNDLE_ID);
        boolean hasLicenseKey = configuration.hasKey(PROP_LICENSE_KEY);
        boolean hasParameters = configuration.hasKey(PROP_PARAMETERS);

        boolean hasRequired = hasHost && hasPort && hasContextName;

        if (!hasRequired) {
            return null;
        }

        R5StreamProtocol protocol = R5StreamProtocol.RTSP;
        String host = configuration.getString(PROP_HOST);
        int port = configuration.getInt(PROP_PORT);
        String contextName = configuration.getString(PROP_CONTEXT_NAME);
        String streamName = configuration.getString(PROP_STREAM_NAME);
        String bundleID = hasBundleID ? configuration.getString(PROP_BUNDLE_ID) : "com.red5pro.android";
        String licenseKey = hasLicenseKey ? configuration.getString(PROP_LICENSE_KEY) : "";
        float bufferTime = hasBufferTime ? (float) configuration.getDouble(PROP_BUFFER_TIME) : 0.5f;
        float streamBufferTime = hasStreamBufferTime ? (float) configuration.getDouble(PROP_STREAM_BUFFER_TIME) : 2.0f;
        String parameters = hasParameters ? configuration.getString(PROP_PARAMETERS) : "";

        R5Configuration config = new R5Configuration(protocol, host, port, contextName, bufferTime, parameters);
        config.setStreamBufferTime(streamBufferTime);
        config.setBundleID(bundleID);
        config.setStreamName(streamName);
        config.setLicenseKey(licenseKey);

        return config;

    }

    @Override
    public void receiveCommand(final R5VideoViewLayout root, int commandId, @Nullable ReadableArray args) {

        Log.d(TAG, "Command(" + commandId + ")");
        if (args != null) {
            Log.d(TAG, "Args are " + args.toString());
        }

        switch (commandId) {
            case COMMAND_UPDATE_SCALE_SIZE:

                int updateWidth = args.getInt(0);
                int updateHeight = args.getInt(1);
                int screenWidth = args.getInt(2);
                int screenHeight = args.getInt(3);
                root.updateScaleSize(updateWidth, updateHeight, screenWidth, screenHeight);

                break;
            case COMMAND_SUBSCRIBE:

                final String streamName = args.size() > 0
                        ? args.getString(0) : root.getConfiguration().getStreamName();

                R5StreamInstance instance;
                if (!streamMap.containsKey(streamName)) {
                    instance = new R5StreamSubscriber(mContext);
                    streamMap.put(streamName, instance);
                    root.setStreamInstance(instance);
                    root.subscribe(streamName);
                } else {
                    instance = streamMap.get(streamName);
                    root.setStreamInstance(instance);
                    if (root.mAttached) {
                        root.attach();
                    }
                }

                break;
            case COMMAND_UNSUBSCRIBE:

                final String unsubscribe_streamName = args.size() > 0
                        ? args.getString(0) : root.getConfiguration().getStreamName();

                R5StreamInstance unsubscribe_instance;
                if (streamMap.containsKey(unsubscribe_streamName)) {
                    unsubscribe_instance = streamMap.get(unsubscribe_streamName);
                    ((R5StreamSubscriber)unsubscribe_instance).unsubscribe();
                    root.unsubscribe();
                    root.setStreamInstance(null);
                    streamMap.remove(unsubscribe_streamName);
                }

                break;
            case COMMAND_PUBLISH:

                final int type = args.getInt(1);

                R5Stream.RecordType recordType = RecordTypeUtil.typeFromJSEnumValue(type);

                final String pub_streamName = args.size() > 0
                        ? args.getString(0) : root.getConfiguration().getStreamName();

                R5StreamInstance pub_instance;
                if (!streamMap.containsKey(pub_streamName)) {
                    pub_instance = new R5StreamPublisher(mContext);
                    streamMap.put(pub_streamName, pub_instance);
                    root.setStreamInstance(pub_instance);
                    root.publish(pub_streamName, recordType);
                } else {
                    pub_instance = streamMap.get(pub_streamName);
                    root.setStreamInstance(pub_instance);
                    if (root.mAttached) {
                        root.attach();
                    }
                }

                break;
            case COMMAND_UNPUBLISH:

                final String unpublish_streamName = args.size() > 0
                        ? args.getString(0) : root.getConfiguration().getStreamName();

                R5StreamInstance unpublish_instance;
                if (streamMap.containsKey(unpublish_streamName)) {
                    unpublish_instance = streamMap.get(unpublish_streamName);
                    ((R5StreamPublisher)unpublish_instance).unpublish();
                    root.unpublish();
                    root.setStreamInstance(null);
                    streamMap.remove(unpublish_streamName);
                }

                break;
            case COMMAND_SWAP_CAMERA:

                root.swapCamera();

                break;
            case COMMAND_UPDATE_SCALE_MODE:

                final int mode = args.getInt(0);
                root.updateScaleMode(mode);

                break;
            case COMMAND_MUTE_AUDIO:

                root.muteAudio();

                break;
            case COMMAND_UNMUTE_AUDIO:

                root.unmuteAudio();

                break;
            case COMMAND_MUTE_VIDEO:

                root.muteVideo();

                break;
            case COMMAND_UNMUTE_VIDEO:

                root.unmuteVideo();

                break;
            case COMMAND_SET_PLAYBACK_VOLUME:

                final int value = args.getInt(0);
                root.setPlaybackVolume(value/100);

                break;
            case COMMAND_DETACH:

                Log.d(TAG, ":detach()");

                root.detach();

                final String detach_stream_id = args.getString(0);
                R5StreamInstance detach_stream = mStreamModule.getStreamInstance(detach_stream_id);
                if (detach_stream != null) {
                    root.setStreamInstance(null);
                } else {
                    Log.d(TAG, "Could not detach. No matching stream with id:(" + detach_stream_id + ") stored.");
                }

                break;
            case COMMAND_ATTACH:

                Log.d(TAG, ":attach()");

                final String attach_stream_id = args.getString(0);
                R5StreamInstance attach_stream = mStreamModule.getStreamInstance(attach_stream_id);
                if (attach_stream != null) {
                    root.setStreamInstance(attach_stream);
                    root.attach();
                } else {
                    Log.d(TAG, "Could not attach. No matching stream with id:(" + attach_stream_id + ") stored.");
                }

                break;
            default:
                super.receiveCommand(root, commandId, args);
                break;
        }
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        MapBuilder.Builder<String, Integer> builder = MapBuilder.builder();
        for (R5VideoViewLayout.Commands command : R5VideoViewLayout.Commands.values()) {
            builder.put(command.toString(), command.getValue());
        }
        return builder.build();
    }

    @Override
    @Nullable
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        MapBuilder.Builder<String, Object> builder = MapBuilder.builder();
        for (R5VideoViewLayout.Events event : R5VideoViewLayout.Events.values()) {
            builder.put(event.toString(), MapBuilder.of("registrationName", event.toString()));
        }
        return builder.build();
    }

    private R5Configuration createConfigurationFromMap(ReadableMap configuration) {

        boolean hasHost = configuration.hasKey(PROP_HOST);
        boolean hasPort = configuration.hasKey(PROP_PORT);
        boolean hasContextName = configuration.hasKey(PROP_CONTEXT_NAME);
        boolean hasStreamName = configuration.hasKey(PROP_STREAM_NAME);
        boolean hasBufferTime = configuration.hasKey(PROP_BUFFER_TIME);
        boolean hasStreamBufferTime = configuration.hasKey(PROP_STREAM_BUFFER_TIME);
        boolean hasBundleID = configuration.hasKey(PROP_BUNDLE_ID);
        boolean hasLicenseKey = configuration.hasKey(PROP_LICENSE_KEY);
        boolean hasParameters = configuration.hasKey(PROP_PARAMETERS);

        boolean hasRequired = hasHost && hasPort && hasContextName;

        if (!hasRequired) {
            return null;
        }

        R5StreamProtocol protocol = R5StreamProtocol.RTSP;
        String host = configuration.getString(PROP_HOST);
        int port = configuration.getInt(PROP_PORT);
        String contextName = configuration.getString(PROP_CONTEXT_NAME);
        String streamName = hasStreamName ? configuration.getString(PROP_STREAM_NAME) : "mystream";
        String bundleID = hasBundleID ? configuration.getString(PROP_BUNDLE_ID) : "com.red5pro.android";
        String licenseKey = hasLicenseKey ? configuration.getString(PROP_LICENSE_KEY) : "";
        float bufferTime = hasBufferTime ? (float) configuration.getDouble(PROP_BUFFER_TIME) : 1.0f;
        float streamBufferTime = hasStreamBufferTime ? (float) configuration.getDouble(PROP_STREAM_BUFFER_TIME) : 2.0f;
        String parameters = hasParameters ? configuration.getString(PROP_PARAMETERS) : "";

        Log.d(TAG, "Parameters: " + parameters);

        R5Configuration config = new R5Configuration(protocol, host, port, contextName, bufferTime, parameters);

        config.setStreamBufferTime(streamBufferTime);
        config.setBundleID(bundleID);
        config.setStreamName(streamName);
        config.setLicenseKey(licenseKey);

        return config;

    }

    @ReactProp(name = "configuration")
    public void setConfiguration(R5VideoViewLayout view, ReadableMap configuration) {
        R5Configuration conf = createConfigurationFromMap(configuration);
        boolean autoAttachView = configuration.hasKey("autoAttachView") ? configuration.getBoolean("autoAttachView") : true;
        view.updateConfiguration(conf, configuration.getString("key"), autoAttachView);
    }

    @ReactProp(name = "showDebugView", defaultBoolean = false)
    public void setShowDebugView(R5VideoViewLayout view, boolean showDebug) {
        view.updateShowDebug(showDebug);
    }

    @ReactProp(name = "scaleMode", defaultInt = 0) // 0, 1, 2
    public void setScaleMode(R5VideoViewLayout view, int mode) {
        view.updateScaleMode(mode);
    }

    @ReactProp(name = "logLevel", defaultInt = 3) // LOG_LEVEL_ERROR
    public void setLogLevel(R5VideoViewLayout view, int logLevel) {
        view.updateLogLevel(logLevel);
    }

    @ReactProp(name = "publishVideo", defaultBoolean = true)
    public  void setPublishVideo(R5VideoViewLayout view, boolean useVideo) {
        view.updatePublishVideo(useVideo);
    }

    @ReactProp(name = "publishAudio", defaultBoolean = true)
    public  void setPublishAudio(R5VideoViewLayout view, boolean useAudio) {
        view.updatePublishAudio(useAudio);
    }

    @ReactProp(name = "subscribeVideo", defaultBoolean = true)
    public  void setSubscribeVideo(R5VideoViewLayout view, boolean playbackVideo) {
        view.updateSubscribeVideo(playbackVideo);
    }

    @ReactProp(name = "cameraWidth", defaultInt = 640)
    public void setCameraWidth(R5VideoViewLayout view, int value) {
        view.updateCameraWidth(value);
    }

    @ReactProp(name = "cameraHeight", defaultInt = 360)
    public void setCameraHeight(R5VideoViewLayout view, int value) {
        view.updateCameraHeight(value);
    }

    @ReactProp(name = "bitrate", defaultInt = 750)
    public void setBitrate(R5VideoViewLayout view, int value) {
        view.updatePublishBitrate(value);
    }

    @ReactProp(name = "framerate", defaultInt = 15)
    public void setFramerate(R5VideoViewLayout view, int value) {
        view.updatePublishFramerate(value);
    }

    @ReactProp(name = "audioBitrate", defaultInt = 32)
    public void setAudioBitrate(R5VideoViewLayout view, int value) {
        view.updatePublishAudioBitrate(value);
    }

    @ReactProp(name = "audioSampleRate", defaultInt = 44100)
    public void setAudioSampleRate(R5VideoViewLayout view, int value) {
        view.updatePublishAudioSampleRate(value);
    }

    /*
     *
        public static enum PlaybackMode {
            AEC,
            STANDARD;

            private PlaybackMode() {}
        }
     *
     */
    @ReactProp(name = "audioMode", defaultInt = 0)
    public void setSubscriberAudioMode(R5VideoViewLayout view, int value) {
        view.updateSubscriberAudioMode(value);
    }

    @ReactProp(name = "useAdaptiveBitrateController", defaultBoolean = false)
    public void setUseAdaptiveBitrateController(R5VideoViewLayout view, boolean value) {
        view.updatePublisherUseAdaptiveBitrateController(value);
    }

    @ReactProp(name = "useBackfacingCamera", defaultBoolean = false)
    public void setUseBackfacingCamera(R5VideoViewLayout view, boolean value) {
        view.updatePublisherUseBackfacingCamera(value);
    }

    @ReactProp(name = "enableBackgroundStreaming", defaultBoolean = false)
    public void setEnableBackgroundStreaming(R5VideoViewLayout view, boolean value) {
        view.updatePubSubBackgroundStreaming(value);
    }

    @ReactProp(name = "zOrderOnTop", defaultBoolean = true)
    public  void setZOrderOnTop(R5VideoViewLayout view, boolean value) {
        view.updateZOrderOnTop(value);
    }

    @ReactProp(name = "zOrderMediaOverlay", defaultBoolean = true)
    public  void setZOrderOverlayMedia(R5VideoViewLayout view, boolean value) {
        view.updateZOrderMediaOverlay(value);
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        return super.getConstants();
    }

    @Override
    public boolean hasConstants() {
        return super.hasConstants();
    }

}
