package com.red5pro.reactnative.stream;

import com.facebook.react.bridge.ReadableMap;

import java.util.ArrayList;

public class R5StreamProps {

	public int logLevel;
	public int audioMode;
	public int scaleMode;
	public boolean showDebugView;
	public boolean enableBackgroundStreaming;

	public boolean subscribeVideo;

	public boolean publishVideo;
	public boolean publishAudio;
	public int cameraWidth;
	public int cameraHeight;
	public int bitrate;
	public int framerate;
	public int audioBitrate;
	public int audioSampleRate;
	public boolean useBackfacingCamera;
	public boolean useAdaptiveBitrateController;

	public static final String PROP_LOG_LEVEL = "logLevel";
	public static final String PROP_AUDIO_MODE = "audioMode";
	public static final String PROP_SCALE_MODE = "scaleMode";
	public static final String PROP_SHOW_DEBUG = "showDebugView";

	public static final String PROP_SUBSCRIBE_VIDEO = "subscribeVideo";

	public static final String PROP_PUBLISH_VIDEO = "publishVideo";
	public static final String PROP_PUBLISH_AUDIO = "publishAudio";
	public static final String PROP_CAMERA_WIDTH = "cameraWidth";
	public static final String PROP_CAMERA_HEIGHT = "cameraHeight";
	public static final String PROP_BITRATE = "bitrate";
	public static final String PROP_FRAMERATE = "framerate";
	public static final String PROP_AUDIO_BITRATE = "audioBitrate";
	public static final String PROP_AUDIO_SAMPLE_RATE = "audioSampleRate";
	public static final String PROP_BACKFACING_CAMERA = "useBackfacingCamera";
	public static final String PROP_BACKGROUND_STREAMING = "enableBackgroundStreaming";
	public static final String PROP_ABR_CONTROLLER = "useAdaptiveBitrateController";

	public static R5StreamProps fromMap (ReadableMap map) {

		R5StreamProps props  = new R5StreamProps();
		props.logLevel = map.hasKey(R5StreamProps.PROP_LOG_LEVEL) ? map.getInt(R5StreamProps.PROP_LOG_LEVEL) : 3;
		props.audioMode = map.hasKey(R5StreamProps.PROP_AUDIO_MODE) ? map.getInt(R5StreamProps.PROP_AUDIO_MODE) : 0;
		props.scaleMode = map.hasKey(R5StreamProps.PROP_SCALE_MODE) ? map.getInt(R5StreamProps.PROP_SCALE_MODE) : 0;
		props.showDebugView = map.hasKey(R5StreamProps.PROP_SHOW_DEBUG) ? map.getBoolean(R5StreamProps.PROP_SHOW_DEBUG) : false;
		props.subscribeVideo = map.hasKey(R5StreamProps.PROP_SUBSCRIBE_VIDEO) ? map.getBoolean(R5StreamProps.PROP_SUBSCRIBE_VIDEO) : true;
		props.publishVideo = map.hasKey(R5StreamProps.PROP_PUBLISH_VIDEO) ? map.getBoolean(R5StreamProps.PROP_PUBLISH_VIDEO) : true;
		props.publishAudio = map.hasKey(R5StreamProps.PROP_PUBLISH_AUDIO) ? map.getBoolean(R5StreamProps.PROP_PUBLISH_AUDIO) : true;
		props.cameraWidth = map.hasKey(R5StreamProps.PROP_CAMERA_WIDTH) ? map.getInt(R5StreamProps.PROP_CAMERA_WIDTH) : 640;
		props.cameraHeight = map.hasKey(R5StreamProps.PROP_CAMERA_HEIGHT) ? map.getInt(R5StreamProps.PROP_CAMERA_HEIGHT) : 360;
		props.bitrate = map.hasKey(R5StreamProps.PROP_BITRATE) ? map.getInt(R5StreamProps.PROP_BITRATE) : 750;
		props.framerate = map.hasKey(R5StreamProps.PROP_FRAMERATE) ? map.getInt(R5StreamProps.PROP_FRAMERATE) : 15;
		props.audioBitrate = map.hasKey(R5StreamProps.PROP_AUDIO_BITRATE) ? map.getInt(R5StreamProps.PROP_AUDIO_BITRATE) : 32;
		props.audioSampleRate = map.hasKey(R5StreamProps.PROP_AUDIO_SAMPLE_RATE) ? map.getInt(R5StreamProps.PROP_AUDIO_SAMPLE_RATE) : 44100;
		props.useBackfacingCamera = map.hasKey(R5StreamProps.PROP_BACKFACING_CAMERA) ? map.getBoolean(R5StreamProps.PROP_BACKFACING_CAMERA) : false;
		props.enableBackgroundStreaming = map.hasKey(R5StreamProps.PROP_BACKGROUND_STREAMING) ? map.getBoolean(R5StreamProps.PROP_BACKGROUND_STREAMING) : false;
		props.useAdaptiveBitrateController = map.hasKey(R5StreamProps.PROP_ABR_CONTROLLER) ? map.getBoolean(R5StreamProps.PROP_ABR_CONTROLLER) : false;
		return props;

	}

	@Override
	public String toString () {
		ArrayList<String> props = new ArrayList<String>();
		props.add("logLevel=" + logLevel);
		props.add("audioMode=" + audioMode);
		props.add("scaleMode=" + scaleMode);
		props.add("showDebugView=" + showDebugView);
		props.add("subscribeVideo=" + subscribeVideo);
		props.add("publishVideo=" + publishVideo);
		props.add("publishAudio=" + publishAudio);
		props.add("cameraWidth=" + cameraWidth);
		props.add("cameraHeight=" + cameraHeight);
		props.add("bitrate=" + bitrate);
		props.add("framerate=" + framerate);
		props.add("audioBitrate=" + audioBitrate);
		props.add("audioSampleRate=" + audioSampleRate);
		props.add("useBackfacingCamera=" + useBackfacingCamera);
		props.add("enableBackgroundStreaming=" + enableBackgroundStreaming);
		props.add("useAdaptiveBitrateController=" + useAdaptiveBitrateController);
		return props.toString();
	}
}
