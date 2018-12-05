package com.red5pro.reactnative.module;

import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.red5pro.reactnative.stream.R5StreamInstance;
import com.red5pro.reactnative.stream.R5StreamProps;
import com.red5pro.reactnative.stream.R5StreamPublisher;
import com.red5pro.reactnative.stream.R5StreamSubscriber;
import com.red5pro.reactnative.util.RecordTypeUtil;
import com.red5pro.reactnative.view.R5VideoViewLayout;
import com.red5pro.streaming.R5Stream;
import com.red5pro.streaming.R5StreamProtocol;
import com.red5pro.streaming.config.R5Configuration;

import java.util.Map;
import java.util.HashMap;

public class R5StreamModule extends ReactContextBaseJavaModule {

	private static final String TAG = "R5StreamModule";
	private static final String REACT_CLASS = "R5StreamModule";

	private static final String E_CONFIGURATION_ERROR = "E_CONFIGURATION_ERROR";
    private static final String E_STREAM_ERROR = "E_STREAM_ERROR";

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
	public void init(String id, ReadableMap configuration, Promise promise) {

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
			promise.reject(E_CONFIGURATION_ERROR, "Missing required host, port and/or context name for configuratoin.");
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

		Log.d(TAG, "init:id(" + id + ")");
		streamMap.put(id, new R5StreamItem(config));

		promise.resolve(id);

	}

	@ReactMethod
	public void subscribe (String streamId, ReadableMap streamProps, Promise promise) {
		if (streamMap.containsKey(streamId)) {
			Log.d(TAG, "subscribe:id(" + streamId + ")");
			R5StreamProps props = R5StreamProps.fromMap(streamProps);
			R5StreamItem item = streamMap.get(streamId);
			R5StreamInstance instance = new R5StreamSubscriber(this.getReactApplicationContext());
			item.setInstance(instance);
			((R5StreamSubscriber) instance).subscribe(item.getConfiguration(),
                    props);
			promise.resolve(streamId);
		} else {
			promise.reject(E_CONFIGURATION_ERROR, "Stream Configuration with id(" + streamId + ") does not exist.");
		}
	}

	@ReactMethod
	public void unsubscribe (String streamId, Promise promise) {
		if (streamMap.containsKey(streamId)) {
			Log.d(TAG, "unsubscribe:id(" + streamId + ")");
			R5StreamItem item = streamMap.get(streamId);
			R5StreamSubscriber instance = ((R5StreamSubscriber) item.getInstance());
			if (instance != null) {
				instance.unsubscribe();
				promise.resolve(streamId);
				return;
			}
		}
        promise.reject(E_STREAM_ERROR, "Stream with id(" + streamId + ") not found.");
	}

	@ReactMethod
	public void publish (String streamId, int streamType, ReadableMap streamProps, Promise promise) {
		if (streamMap.containsKey(streamId)) {
			Log.d(TAG, "publish:id(" + streamId + ")");
			R5StreamProps props = R5StreamProps.fromMap(streamProps);
			R5StreamItem item = streamMap.get(streamId);
			R5StreamInstance instance = new R5StreamPublisher(this.getReactApplicationContext());
			item.setInstance(instance);
			((R5StreamPublisher) instance).publish(item.getConfiguration(),
					RecordTypeUtil.typeFromJSEnumValue(streamType),
					props);
			promise.resolve(streamId);
		} else {
			promise.reject(E_CONFIGURATION_ERROR, "Stream Configuration with id(" + streamId + ") does not exist.");
		}
	}

	@ReactMethod
	public void unpublish (String streamId, Promise promise) {
		if (streamMap.containsKey(streamId)) {
			Log.d(TAG, "unpublish:id(" + streamId + ")");
			R5StreamItem item = streamMap.get(streamId);
			R5StreamPublisher instance = ((R5StreamPublisher) item.getInstance());
			if (instance != null) {
				instance.unpublish();
				promise.resolve(streamId);
				return;
			}
		}
		promise.reject(E_STREAM_ERROR, "Stream with id(" + streamId + ") not found.");
	}

	@ReactMethod
    public void setPlaybackVolume (String streamId, int value) {
        if (streamMap.containsKey(streamId)) {
            Log.d(TAG, "setPlaybackVolume:id(" + streamId + ") = " + value);
            R5StreamItem item = streamMap.get(streamId);
            R5StreamSubscriber instance = ((R5StreamSubscriber) item.getInstance());
            if (instance != null) {
                instance.setPlaybackVolume(value/100);
                return;
            }
        }
        Log.d(TAG, "Could not set playback volume. Stream :id(" + streamId + ") not found.");
    }

	@ReactMethod
	public void swapCamera (String streamId) {
		if (streamMap.containsKey(streamId)) {
			Log.d(TAG, "swapCamera:id(" + streamId + ")");
			R5StreamItem item = streamMap.get(streamId);
			R5StreamPublisher instance = ((R5StreamPublisher) item.getInstance());
			if (instance != null) {
				instance.swapCamera();
				return;
			}
		}
		Log.d(TAG, "Could not swap camera on broadcast. Stream :id(" + streamId + ") not found.");
	}

	@ReactMethod
	public void muteAudio (String streamId) {
		if (streamMap.containsKey(streamId)) {
			Log.d(TAG, "muteAudio:id(" + streamId + ")");
			R5StreamItem item = streamMap.get(streamId);
			R5StreamPublisher instance = ((R5StreamPublisher) item.getInstance());
			if (instance != null) {
				instance.muteAudio();
				return;
			}
		}
		Log.d(TAG, "Could not mute audio on broadcast. Stream :id(" + streamId + ") not found.");
	}

	@ReactMethod
	public void unmuteAudio (String streamId) {
		if (streamMap.containsKey(streamId)) {
			Log.d(TAG, "unmuteAudio:id(" + streamId + ")");
			R5StreamItem item = streamMap.get(streamId);
			R5StreamPublisher instance = ((R5StreamPublisher) item.getInstance());
			if (instance != null) {
				instance.unmuteAudio();
				return;
			}
		}
		Log.d(TAG, "Could not unmute audio on broadcast. Stream :id(" + streamId + ") not found.");
	}

	@ReactMethod
	public void muteVideo (String streamId) {
		if (streamMap.containsKey(streamId)) {
			Log.d(TAG, "muteVideo:id(" + streamId + ")");
			R5StreamItem item = streamMap.get(streamId);
			R5StreamPublisher instance = ((R5StreamPublisher) item.getInstance());
			if (instance != null) {
				instance.muteVideo();
				return;
			}
		}
		Log.d(TAG, "Could not mute video on broadcast. Stream :id(" + streamId + ") not found.");
	}

	@ReactMethod
	public void unmuteVideo (String streamId) {
		if (streamMap.containsKey(streamId)) {
			Log.d(TAG, "unmuteVideo:id(" + streamId + ")");
			R5StreamItem item = streamMap.get(streamId);
			R5StreamPublisher instance = ((R5StreamPublisher) item.getInstance());
			if (instance != null) {
				instance.unmuteVideo();
				return;
			}
		}
		Log.d(TAG, "Could not unmute video on broadcast. Stream :id(" + streamId + ") not found.");
	}

	public R5StreamInstance getStreamInstance (String streamId) {
		if (streamMap.containsKey(streamId)) {
			Log.d(TAG, "getStreamInstance(" + streamId + ")");
			return streamMap.get(streamId).getInstance();
		}
		return null;
	}

	@Override
	public String getName() {
		return REACT_CLASS;
	}
}
