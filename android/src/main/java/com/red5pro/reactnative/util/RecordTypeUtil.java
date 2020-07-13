package com.red5pro.reactnative.util;

import com.red5pro.streaming.R5Stream;

public class RecordTypeUtil {

	// The enum values on JS side are: Live,Record,Append.
	// The enum ordinals on the Native side are: Record,Append,Live.

	public static int intFromNativeType (R5Stream.RecordType type) {
		if (type == R5Stream.RecordType.Record) {
			return 1;
		} else if (type == R5Stream.RecordType.Append) {
			return 2;
		}
		return 0;
	}

	public static R5Stream.RecordType typeFromJSEnumValue (int value) {
		if (value == 1) {
			return R5Stream.RecordType.Record;
		} else if (value == 2) {
			return R5Stream.RecordType.Append;
		}
		return R5Stream.RecordType.Live;
	}

}
