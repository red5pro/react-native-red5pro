package com.red5pro.reactnative.util;


public class MathUtil {

	// Android versions < 6 do not include the java.lang.Math.toIntExact
	// See: https://stackoverflow.com/questions/60015731/android-version-compatibility-for-math-tointexact-utility-method
	public static int toIntExact(long value) {
		if ((int)value != value) {
			throw new ArithmeticException("integer overflow");
		}
		return (int)value;
	}
}
