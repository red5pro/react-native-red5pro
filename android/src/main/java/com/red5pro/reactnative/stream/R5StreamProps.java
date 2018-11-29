package com.red5pro.reactnative.stream;

public class R5StreamProps {

	public int logLevel;
	public int audioMode;
	public int scaleMode;
	public boolean showDebugView;
	public boolean subscribeVideo;
	public boolean useBackfacingCamera;
	public boolean enableBackgroundStreaming;

	public static final String PROP_BACKGROUND_STREAMING = "enableBackgroundStreaming";
	public static final String PROP_BACKFACING_CAMERA = "useBackfacingCamera";
	public static final String PROP_SUBSCRIBE_VIDEO = "subscribeVideo";
	public static final String PROP_SHOW_DEBUG = "showDebugView";
	public static final String PROP_LOG_LEVEL = "logLevel";
	public static final String PROP_AUDIO_MODE = "audioMode";
	public static final String PROP_SCALE_MODE = "scaleMode";

}
