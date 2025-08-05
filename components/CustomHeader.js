import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomHeader = ({ 
  title, 
  onBackPress, 
  showBackButton = true,
  rightComponent = null,
  backgroundColor = '#fff',
  titleColor = '#333',
  backButtonColor = '#333'
}) => {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={backButtonColor} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { color: titleColor }]}>{title}</Text>
      </View>
      
      <View style={styles.headerRight}>
        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'SUIT-SemiBold',
    fontWeight: 500,
    letterSpacing: -0.4,
    color: '4B4B4B',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
});

export default CustomHeader;