package com.red5pro.reactnative.stream;

import com.facebook.react.bridge.LifecycleEventListener;
import com.red5pro.streaming.event.R5ConnectionListener;
import com.red5pro.streaming.view.R5VideoView;

public interface R5StreamInstance extends R5ConnectionListener, LifecycleEventListener {

	int getEmitterId();
	void setEmitterId(int id);
	void setVideoView (R5VideoView view);
	void removeVideoView (R5VideoView view);
	void updateLogLevel(int level);
	void updateScaleMode(int mode);

}
