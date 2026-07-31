import React from "react";
import { View, Text, StyleSheet } from "react-native";
export default function SignIn() { return <View style={s.c}><Text style={s.t}>Sign In</Text></View>; }
const s = StyleSheet.create({ c: { flex:1, alignItems:"center", justifyContent:"center" }, t: { fontSize:20 } });
