import React from "react";
import { View, Text, StyleSheet } from "react-native";
export default function MarketplaceScreen() { return <View style={s.c}><Text style={s.t}>Marketplace</Text><Text>Browse listings</Text></View>; }
const s = StyleSheet.create({ c: { flex:1, alignItems:"center", justifyContent:"center", padding:16 }, t: { fontSize:24, fontWeight:"bold", marginBottom:8 } });
