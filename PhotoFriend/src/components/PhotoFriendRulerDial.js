import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { usePhotoFriend } from '../context/PhotoFriendContext';
import {
  ISO_VALUES,
  EV_COMP_VALUES,
  SHUTTER_SPEEDS,
  APERTURES,
  FOCAL_LENGTHS,
  SUBJECT_DISTANCES,
} from '../utils/photoFriendMath';

export default function PhotoFriendRulerDial() {
  const {
    ev,
    setEv,
    iso,
    setIso,
    evComp,
    setEvComp,
    shutter,
    setShutter,
    aperture,
    setAperture,
    focalLength,
    setFocalLength,
    distanceFeet,
    setDistanceFeet,
    dofResult,
    sceneLabel,
  } = usePhotoFriend();

  const evNumbers = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  return (
    <View style={styles.container}>
      <View style={styles.trackRow}>
        <View style={styles.trackHeader}>
          <Text style={styles.sceneText} numberOfLines={1}>
            {sceneLabel}
          </Text>
          <Text style={styles.trackTag}>EV</Text>
        </View>

        <View style={styles.rulerWrap}>
          <View style={styles.centerRedIndicator} pointerEvents="none" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {evNumbers.map((evNum) => {
              const isSelected = Math.round(ev) === evNum;
              return (
                <TouchableOpacity
                  key={`ev-${evNum}`}
                  style={styles.rulerItem}
                  onPress={() => setEv(evNum)}
                >
                  <View style={[styles.tickLine, isSelected && styles.tickLineSelected]} />
                  <Text style={[styles.rulerText, isSelected && styles.rulerTextSelected]}>
                    {evNum > 0 ? `${evNum}` : evNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View style={styles.splitRow}>
        <View style={styles.halfTrack}>
          <View style={styles.trackHeader}>
            <Text style={styles.valRedText}>{iso}</Text>
            <Text style={styles.trackTagSmall}>ISO</Text>
          </View>
          <View style={styles.rulerWrap}>
            <View style={styles.centerRedIndicator} pointerEvents="none" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContentSmall}>
              {ISO_VALUES.map((isoVal) => {
                const isSelected = iso === isoVal;
                return (
                  <TouchableOpacity
                    key={`iso-${isoVal}`}
                    style={styles.rulerItemSmall}
                    onPress={() => setIso(isoVal)}
                  >
                    <View style={[styles.tickLine, isSelected && styles.tickLineSelected]} />
                    <Text style={[styles.rulerText, isSelected && styles.rulerTextSelected]}>
                      {isoVal}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <View style={styles.vDivider} />

        <View style={styles.halfTrack}>
          <View style={styles.trackHeader}>
            <Text style={styles.valRedText}>{evComp > 0 ? `+${evComp}` : evComp}</Text>
            <Text style={styles.trackTagSmall}>EV comp</Text>
          </View>
          <View style={styles.rulerWrap}>
            <View style={styles.centerRedIndicator} pointerEvents="none" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContentSmall}>
              {EV_COMP_VALUES.map((compVal) => {
                const isSelected = evComp === compVal;
                return (
                  <TouchableOpacity
                    key={`comp-${compVal}`}
                    style={styles.rulerItemSmall}
                    onPress={() => setEvComp(compVal)}
                  >
                    <View style={[styles.tickLine, isSelected && styles.tickLineSelected]} />
                    <Text style={[styles.rulerText, isSelected && styles.rulerTextSelected]}>
                      {compVal > 0 ? `+${compVal}` : compVal}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>

      <View style={styles.trackRow}>
        <View style={styles.trackHeader}>
          <Text style={styles.valRedText}>{shutter.label}</Text>
          <Text style={styles.trackTag}>s</Text>
        </View>

        <View style={styles.rulerWrap}>
          <View style={styles.centerRedIndicator} pointerEvents="none" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {SHUTTER_SPEEDS.map((sObj) => {
              const isSelected = shutter.label === sObj.label;
              return (
                <TouchableOpacity
                  key={`shutter-${sObj.label}`}
                  style={styles.rulerItem}
                  onPress={() => setShutter(sObj)}
                >
                  <View style={[styles.tickLine, isSelected && styles.tickLineSelected]} />
                  <Text style={[styles.rulerText, isSelected && styles.rulerTextSelected]}>
                    {sObj.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View style={styles.trackRow}>
        <View style={styles.trackHeader}>
          <Text style={styles.valRedText}>{aperture}</Text>
          <Text style={styles.trackTag}>f</Text>
        </View>

        <View style={styles.rulerWrap}>
          <View style={styles.centerRedIndicator} pointerEvents="none" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {APERTURES.map((apVal) => {
              const isSelected = aperture === apVal;
              return (
                <TouchableOpacity
                  key={`ap-${apVal}`}
                  style={styles.rulerItem}
                  onPress={() => setAperture(apVal)}
                >
                  <View style={[styles.tickLine, isSelected && styles.tickLineSelected]} />
                  <Text style={[styles.rulerText, isSelected && styles.rulerTextSelected]}>
                    {apVal}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View style={styles.trackRow}>
        <View style={styles.trackHeader}>
          <Text style={styles.valRedText}>{focalLength}</Text>
          <Text style={styles.trackTag}>mm</Text>
        </View>

        <View style={styles.rulerWrap}>
          <View style={styles.centerRedIndicator} pointerEvents="none" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {FOCAL_LENGTHS.map((flVal) => {
              const isSelected = focalLength === flVal;
              return (
                <TouchableOpacity
                  key={`fl-${flVal}`}
                  style={styles.rulerItem}
                  onPress={() => setFocalLength(flVal)}
                >
                  <View style={[styles.tickLine, isSelected && styles.tickLineSelected]} />
                  <Text style={[styles.rulerText, isSelected && styles.rulerTextSelected]}>
                    {flVal}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <View style={styles.trackRow}>
        <View style={styles.trackHeader}>
          <View style={styles.dofReadoutCol}>
            <Text style={styles.valRedText}>
              {dofResult.nearLimitFeet} {distanceFeet} {dofResult.farLimitFeet === Infinity ? '∞' : dofResult.farLimitFeet}
            </Text>
            <Text style={styles.dofRangeText}>
              -{dofResult.frontDofFeet} +{dofResult.backDofFeet === Infinity ? '∞' : dofResult.backDofFeet}
            </Text>
          </View>
          <Text style={styles.trackTag}>ft</Text>
        </View>

        <View style={styles.rulerWrap}>
          <View style={styles.tripleDofIndicators} pointerEvents="none">
            <View style={styles.dofPinNear} />
            <View style={styles.centerRedIndicator} />
            <View style={styles.dofPinFar} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {SUBJECT_DISTANCES.map((dObj) => {
              const isSelected = distanceFeet === dObj.feet;
              const isInf = dObj.feet === Infinity;
              return (
                <TouchableOpacity
                  key={`dist-${dObj.feet}`}
                  style={styles.rulerItem}
                  onPress={() => setDistanceFeet(dObj.feet)}
                >
                  <View style={[styles.tickLine, isSelected && styles.tickLineSelected]} />
                  <Text style={[styles.rulerText, isSelected && styles.rulerTextSelected]}>
                    {isInf ? '∞' : dObj.feet}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E2E4E9',
    borderTopWidth: 2,
    borderTopColor: '#B0B4C0',
    paddingVertical: 4,
  },
  trackRow: {
    height: 58,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD0DC',
    backgroundColor: '#ECEEF4',
    position: 'relative',
    justifyContent: 'center',
  },
  splitRow: {
    height: 58,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD0DC',
    backgroundColor: '#ECEEF4',
  },
  halfTrack: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  vDivider: {
    width: 1,
    backgroundColor: '#CBD0DC',
  },
  trackHeader: {
    position: 'absolute',
    top: 4,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  sceneText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
    maxWidth: '85%',
  },
  valRedText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '800',
  },
  trackTag: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '800',
  },
  trackTagSmall: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
  },
  dofReadoutCol: {
    flexDirection: 'column',
  },
  dofRangeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
    marginTop: -2,
  },

  rulerWrap: {
    marginTop: 18,
    height: 38,
    justifyContent: 'center',
    position: 'relative',
  },
  centerRedIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 4,
    marginLeft: -2,
    backgroundColor: '#EF4444',
    borderRadius: 2,
    zIndex: 15,
  },
  tripleDofIndicators: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 44,
    marginLeft: -22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 15,
  },
  dofPinNear: {
    width: 3,
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 1.5,
    opacity: 0.8,
  },
  dofPinFar: {
    width: 3,
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 1.5,
    opacity: 0.8,
  },

  scrollContent: {
    paddingHorizontal: '45%',
    alignItems: 'center',
  },
  scrollContentSmall: {
    paddingHorizontal: '35%',
    alignItems: 'center',
  },
  rulerItem: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rulerItemSmall: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickLine: {
    width: 1.5,
    height: 12,
    backgroundColor: '#6B7280',
    marginBottom: 4,
  },
  tickLineSelected: {
    backgroundColor: '#EF4444',
    width: 2.5,
    height: 16,
  },
  rulerText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },
  rulerTextSelected: {
    color: '#111827',
    fontWeight: '900',
    fontSize: 15,
  },
});
