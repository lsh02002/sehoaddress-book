import React from 'react';
import { View, StyleSheet } from 'react-native';

type TwoDivProps = {
  children: React.ReactNode;
};

export const TwoDiv = ({ children }: TwoDivProps) => {
  const childArray = React.Children.toArray(children);

  return (
    <View style={styles.row}>
      {childArray.map((array, index) => (
        <View key={index} style={styles.col}>
          {array}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
    columnGap: 12,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
});
