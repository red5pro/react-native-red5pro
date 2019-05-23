package com.red5pro.reactnative.module;

import com.red5pro.reactnative.stream.R5StreamInstance;
import com.red5pro.streaming.config.R5Configuration;

public class R5StreamItem {

	private R5Configuration configuration;
	private R5StreamInstance instance;

	public R5StreamItem (R5Configuration configuration) {
		this.configuration = configuration;
	}

	public R5Configuration getConfiguration() {
		return configuration;
	}

	public R5StreamInstance getInstance() {
		return instance;
	}

	public void setInstance(R5StreamInstance instance) {
		this.instance = instance;
	}

}
