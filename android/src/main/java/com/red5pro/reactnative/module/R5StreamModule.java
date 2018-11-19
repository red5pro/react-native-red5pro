package com.red5pro.reactnative.module;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.red5pro.reactnative.stream.R5StreamInstance;
import com.red5pro.reactnative.stream.R5StreamSubscriber;
import com.red5pro.reactnative.view.R5VideoViewLayout;
import com.red5pro.streaming.R5StreamProtocol;
import com.red5pro.streaming.config.R5Configuration;

import java.util.Map;
import java.util.HashMap;

public class R5StreamModule extends ReactContextBaseJavaModule {

	private static final String REACT_CLASS = "R5StreamModule";

	private static final String PROP_HOST = "host";
	private static final String PROP_PORT = "port";
	private static final String PROP_CONTEXT_NAME = "contextName";
	private static final String PROP_STREAM_NAME = "streamName";
	private static final String PROP_BUFFER_TIME = "bufferTime";
	private static final String PROP_LICENSE_KEY = "licenseKey";
	private static final String PROP_BUNDLE_ID = "bundleID";
	private static final String PROP_PARAMETERS = "parameters";
	private static final String PROP_STREAM_BUFFER_TIME = "streamBufferTime";

	protected Map<String, R5StreamItem> streamMap;

	public R5StreamModule(ReactApplicationContext reactContext) {

		super(reactContext);
		streamMap = new HashMap<>();

	}

	@ReactMethod
	public String init(ReadableMap configuration) {

		boolean hasHost = configuration.hasKey(PROP_HOST);
		boolean hasPort = configuration.hasKey(PROP_PORT);
		boolean hasContextName = configuration.hasKey(PROP_CONTEXT_NAME);
		boolean hasStreamName = configuration.hasKey(PROP_STREAM_NAME);
		boolean hasBufferTime = configuration.hasKey(PROP_BUFFER_TIME);
		boolean hasStreamBufferTime = configuration.hasKey(PROP_STREAM_BUFFER_TIME);
		boolean hasBundleID = configuration.hasKey(PROP_BUNDLE_ID);
		boolean hasLicenseKey = configuration.hasKey(PROP_LICENSE_KEY);
		boolean hasParameters = configuration.hasKey(PROP_PARAMETERS);

		boolean hasRequired = hasHost && hasPort && hasContextName && hasStreamName;

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

		Log.d("R5StreamModule", "init(" + streamName + ")");
		streamMap.put(streamName, new R5StreamItem(config));

		return streamName;

	}

	// CANT DO: Cannot pass in view context :/
//	@ReactMethod
//	public void setVideoView (final R5VideoViewLayout root, String name) {
//		if (streamMap.containsKey(name)) {
//			R5StreamItem item = streamMap.get(name);
//			R5StreamInstance instance = new R5StreamSubscriber(this.getReactApplicationContext());
//			instance.setVideoView(root.getOrCreateVideoView());
//		}
//	}

	@ReactMethod
	public boolean subscribe (String name, boolean enableBackground) {
		if (streamMap.containsKey(name)) {
			Log.d("R5StreamModule", "subscribe(" + name + ")");
			R5StreamItem item = streamMap.get(name);
			R5StreamInstance instance = new R5StreamSubscriber(this.getReactApplicationContext());
			item.setInstance(instance);
			((R5StreamSubscriber) instance).subscribe(item.getConfiguration(), enableBackground);
			return true;
		}
		return false;
	}

	@ReactMethod
	public boolean unsubscribe (String name) {
		if (streamMap.containsKey(name)) {
			Log.d("R5StreamModule", "unsubscribe(" + name + ")");
			R5StreamItem item = streamMap.get(name);
			R5StreamSubscriber instance = ((R5StreamSubscriber) item.getInstance());
			if (instance != null) {
				instance.unsubscribe();
				return true;
			}
			return false;
		}
		return false;
	}

	@ReactMethod
	public boolean setPlaybackVolume (String name, float value) {
		if (streamMap.containsKey(name)) {
			R5StreamItem item = streamMap.get(name);
			R5StreamSubscriber instance = ((R5StreamSubscriber) item.getInstance());
			if (instance != null) {
				instance.setPlaybackVolume(value);
				return true;
			}
			return false;
		}
		return false;
	}

	@Override
	public String getName() {
		return REACT_CLASS;
	}
}
