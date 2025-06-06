import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  ImageBackground,
  StatusBar,
} from 'react-native';
import color from 'color';
import { IconButton, Portal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageURISource } from 'react-native';
import { Chip } from '../../../../components';
import { coverPlaceholderColor } from '../../../../theme/colors';
import { ThemeColors } from '@theme/types';
import { getString } from '@strings/translations';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CoverImageProps {
  children: React.ReactNode;
  source: ImageURISource;
  theme: ThemeColors;
  hideBackdrop: boolean;
}

interface NovelThumbnailProps {
  source: ImageURISource;
  theme: ThemeColors;
  setCustomNovelCover: () => Promise<void>;
  saveNovelCover: () => Promise<void>;
}

interface NovelTitleProps {
  theme: ThemeColors;
  children: React.ReactNode;
  onLongPress: () => void;
  onPress: () => void;
}

const NovelInfoContainer = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.novelInfoContainer}>{children}</View>
);

const CoverImage = ({
  children,
  source,
  theme,
  hideBackdrop,
}: CoverImageProps) => {
  if (hideBackdrop) {
    return <View>{children}</View>;
  } else {
    return (
      <ImageBackground source={source} style={styles.coverImage}>
        <View
          style={{
            flex: 1,
            backgroundColor: color(theme.background).alpha(0.7).string(),
          }}
        >
          {source.uri ? (
            <LinearGradient
              colors={['rgba(0,0,0,0)', theme.background]}
              locations={[0, 1]}
              style={styles.linearGradient}
            >
              {children}
            </LinearGradient>
          ) : (
            children
          )}
        </View>
      </ImageBackground>
    );
  }
};

const NovelThumbnail = ({
  source,
  theme,
  setCustomNovelCover,
  saveNovelCover,
}: NovelThumbnailProps) => {
  const [expanded, setExpanded] = useState(false);
  const { top, right } = useSafeAreaInsets();

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={styles.novelThumbnailContainer}
    >
      {!expanded ? (
        <Image source={source} style={styles.novelThumbnail} />
      ) : (
        <Portal>
          <IconButton
            icon="content-save"
            style={{
              position: 'absolute',
              top: top + 6,
              right: right + 6,
              zIndex: 10,
            }}
            iconColor={theme.onBackground}
            onPress={saveNovelCover}
          />
          <IconButton
            icon="pencil-outline"
            style={{
              position: 'absolute',
              top: StatusBar.currentHeight ?? 0 + 10,
              right: 60,
              zIndex: 10,
            }}
            iconColor={theme.onBackground}
            onPress={setCustomNovelCover}
          />
          <Pressable
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              flex: 1,
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
            }}
            onPress={() => setExpanded(false)}
          >
            <Image
              source={source}
              resizeMode="contain"
              style={{
                flex: 1,
              }}
            />
          </Pressable>
        </Portal>
      )}
    </Pressable>
  );
};

const NovelTitle = ({
  theme,
  children,
  onLongPress,
  onPress,
}: NovelTitleProps) => (
  <Text
    onLongPress={onLongPress}
    onPress={onPress}
    style={[styles.novelTitle, { color: theme.onBackground }]}
    numberOfLines={4}
  >
    {children}
  </Text>
);

const NovelInfo = ({
  theme,
  children,
}: {
  theme: ThemeColors;
  children: React.ReactNode;
}) => (
  <Text
    style={[styles.novelInfo, { color: theme.onSurfaceVariant }]}
    numberOfLines={1}
  >
    {children}
  </Text>
);

const FollowButton = ({
  theme,
  onPress,
  followed,
}: {
  theme: ThemeColors;
  onPress: () => void;
  followed: boolean;
}) => (
  <View style={{ borderRadius: 4, overflow: 'hidden', flex: 1 }}>
    <Pressable
      android_ripple={{
        color: color(theme.primary).alpha(0.12).string(),
        borderless: false,
      }}
      onPress={onPress}
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 8,
      }}
    >
      <IconButton
        icon={followed ? 'heart' : 'heart-outline'}
        iconColor={followed ? theme.primary : theme.outline}
        size={24}
        style={{ margin: 0 }}
      />
      <Text
        style={{
          fontSize: 12,
          color: followed ? theme.primary : theme.outline,
        }}
      >
        {followed
          ? getString('novelScreen.inLibaray')
          : getString('novelScreen.addToLibaray')}
      </Text>
    </Pressable>
  </View>
);

const TrackerButton = ({
  theme,
  isTracked,
  onPress,
}: {
  theme: ThemeColors;
  onPress: () => void;
  isTracked: boolean;
}) => (
  <View style={{ borderRadius: 4, overflow: 'hidden', flex: 1 }}>
    <Pressable
      android_ripple={{
        color: theme.rippleColor,
        borderless: false,
      }}
      onPress={onPress}
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 8,
      }}
    >
      <IconButton
        icon={isTracked ? 'check' : 'sync'}
        iconColor={isTracked ? theme.primary : theme.outline}
        size={24}
        style={{ margin: 0 }}
      />
      <Text
        style={{
          fontSize: 12,
          color: isTracked ? theme.primary : theme.outline,
        }}
      >
        {isTracked
          ? getString('novelScreen.tracked')
          : getString('novelScreen.tracking')}
      </Text>
    </Pressable>
  </View>
);

const NovelGenres = ({
  theme,
  genres,
}: {
  theme: ThemeColors;
  genres: string;
}) => {
  const data = genres.split(/,\s*/);

  return (
    <FlatList
      contentContainerStyle={styles.genreContainer}
      horizontal
      data={data}
      keyExtractor={(item, index) => 'genre' + index}
      renderItem={({ item }) => <Chip label={item} theme={theme} />}
      showsHorizontalScrollIndicator={false}
    />
  );
};

export {
  NovelInfoContainer,
  CoverImage,
  NovelThumbnail,
  NovelTitle,
  NovelInfo,
  FollowButton,
  TrackerButton,
  NovelGenres,
};

const styles = StyleSheet.create({
  coverImage: {},
  followButton: {
    alignItems: 'center',
    borderWidth: 0,
    elevation: 0,
    height: 32,
    justifyContent: 'center',
    marginLeft: 16,
    paddingLeft: 4,
  },
  genreChip: {
    borderRadius: 50,
    flex: 1,
    fontSize: 12,
    justifyContent: 'center',
    marginHorizontal: 2,
    paddingHorizontal: 12,
    paddingVertical: 5,
    textTransform: 'capitalize',
  },
  genreContainer: {
    paddingBottom: 4,
    paddingHorizontal: 16,
  },
  linearGradient: {
    flex: 1,
  },
  novelInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  novelInfoContainer: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 0,
    marginTop: 28,
    paddingTop: 90,
  },
  novelThumbnail: {
    backgroundColor: coverPlaceholderColor,
    borderRadius: 6,
    height: 150,
    width: 100,
  },
  novelThumbnailContainer: {
    height: 150,
    marginHorizontal: 4,
    width: 100,
  },
  novelTitle: {
    fontSize: 20,
  },
});
