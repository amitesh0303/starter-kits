import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
export default function NotFound() { return <View style={s.c}><Text style={s.t}>Not Found</Text><Link href="/">Home</Link></View>; }
const s = StyleSheet.create({ c: { flex:1, alignItems:"center", justifyContent:"center" }, t: { fontSize:20, fontWeight:"bold", marginBottom:16 } });
