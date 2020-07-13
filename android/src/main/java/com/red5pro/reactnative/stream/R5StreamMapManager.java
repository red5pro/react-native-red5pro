package com.red5pro.reactnative.stream;

public interface R5StreamMapManager {

	boolean addManagedStream (String name, R5StreamInstance item);
	boolean removeManagedStream (String name);

}
