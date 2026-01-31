import React, { useRef, useEffect } from "react";
import { 
  View, 
  Image, 
  StyleSheet, 
  StatusBar, 
  Dimensions,
  Easing,
  Animated
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Onboarding from "react-native-onboarding-swiper";
import { 
  Text, 
  Button, 
  useTheme,
  Surface,
  IconButton,
  MD3Colors 
} from 'react-native-paper';
import { setOnboarded } from "../utils/storage";

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation, setHasOnboarded }) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Color scheme for modern room renting app
  const colors = {
    primary: '#7B61FF', // Modern purple
    secondary: '#00C2FF', // Vibrant blue
    accent: '#FF6B8B', // Soft pink
    background: '#FFFFFF',
    surface: '#F8FAFF',
    textPrimary: '#1A1D29',
    textSecondary: '#6B7280',
    cardGradient: ['#7B61FF', '#00C2FF'],
  };

  useEffect(() => {
    // Enhanced animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.elastic(1)),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleDone = async () => {
    try {
      await setOnboarded();
      setHasOnboarded(true);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setHasOnboarded(true);
    }
  };

  const handleSkip = async () => {
    await handleDone();
  };

  // Animated gradient background for images
  const GradientBackground = ({ selected }) => {
    const gradientAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(gradientAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(gradientAnim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }, []);

    const interpolatedColor = gradientAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.cardGradient[0], colors.cardGradient[1]]
    });

    return (
      <Animated.View
        style={[
          styles.gradientBackground,
          {
            backgroundColor: interpolatedColor,
            opacity: selected ? 0.8 : 0.3,
          }
        ]}
      />
    );
  };

  const Square = ({ isLight, selected }) => {
    const dotScale = useRef(new Animated.Value(selected ? 1.2 : 1)).current;

    useEffect(() => {
      Animated.spring(dotScale, {
        toValue: selected ? 1.4 : 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }, [selected]);

    return (
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: selected ? colors.primary : 'rgba(123, 97, 255, 0.2)',
            transform: [{ scale: dotScale }],
          }
        ]}
      />
    );
  };

  const NextButton = ({ nextLabel, onPress, ...props }) => {
    const buttonScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(buttonScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Button
          mode="contained"
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.nextButton}
          labelStyle={styles.nextButtonLabel}
          contentStyle={styles.nextButtonContent}
          compact
        >
          {nextLabel || 'Next'}
        </Button>
      </Animated.View>
    );
  };

  const SkipButton = ({ skipLabel, onPress, ...props }) => {
    return (
      <Button
        mode="text"
        onPress={onPress}
        style={styles.skipButton}
        labelStyle={styles.skipButtonLabel}
        compact
      >
        {skipLabel || 'Skip'}
      </Button>
    );
  };

  const DoneButton = ({ onPress, ...props }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    return (
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Button
          mode="contained"
          onPress={onPress}
          style={styles.doneButton}
          labelStyle={styles.doneButtonLabel}
          contentStyle={styles.doneButtonContent}
          icon="rocket-launch-outline"
          compact
        >
          Get Started
        </Button>
      </Animated.View>
    );
  };

  // Custom image component with animations (without emojis/icons)
  const AnimatedImageCard = ({ backgroundUri, index }) => {
    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', `${index % 2 === 0 ? '5' : '-5'}deg`]
    });

    return (
      <Animated.View 
        style={[
          styles.imageCardContainer,
          { 
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
              { rotate: rotate }
            ] 
          }
        ]}
      >
        <Surface style={styles.imageCard} elevation={4}>
          <GradientBackground selected={true} />
          <Image
            source={{ uri: backgroundUri }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />

          {/* Floating decorative elements */}
          <Animated.View 
            style={[
              styles.floatingElement,
              styles.floatingElement1,
              {
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }
                ]
              }
            ]}
          />
          <Animated.View 
            style={[
              styles.floatingElement,
              styles.floatingElement2,
              {
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0]
                    })
                  }
                ]
              }
            ]}
          />
        </Surface>
      </Animated.View>
    );
  };

  // Custom subtitle component for better formatting
  const FormattedSubtitle = ({ text }) => {
    const lines = text.split('\n');
    
    return (
      <View style={styles.subtitleContainer}>
        {lines.map((line, index) => {
          // Check if line starts with bullet or numbered list
          if (line.startsWith('•') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
            return (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={[styles.subtitle, styles.listText]}>{line.replace(/^[•\d.]\s*/, '')}</Text>
              </View>
            );
          }
          return (
            <Text key={index} style={[styles.subtitle, index > 0 && styles.additionalLine]}>
              {line}
            </Text>
          );
        })}
      </View>
    );
  };

  // Custom Subtitle wrapper to ensure consistent styling
  const Subtitle = ({ children }) => {
    if (typeof children === 'string') {
      return <FormattedSubtitle text={children} />;
    }
    
    // If children is already a component (like FormattedSubtitle), render it
    return children;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Onboarding
        onSkip={handleSkip}
        onDone={handleDone}
        DotComponent={Square}
        NextButtonComponent={NextButton}
        SkipButtonComponent={SkipButton}
        DoneButtonComponent={DoneButton}
        bottomBarHighlight={false}
        containerStyles={styles.onboardingContainer}
        titleStyles={[styles.title, { color: colors.textPrimary }]}
        subTitleStyles={{ display: 'none' }} // Hide default subtitle styles
        bottomBarColor="transparent"
        showPagination={true}
        pages={[
          {
            backgroundColor: colors.background,
            image: (
              <AnimatedImageCard 
                backgroundUri="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                index={0}
              />
            ),
            title: "Welcome to ChumbaConnect",
            subtitle: <Subtitle>Discover your perfect home with ease. Browse through apartments, houses, and studios tailored to your needs.</Subtitle>,
          },
          {
            backgroundColor: colors.surface,
            image: (
              <AnimatedImageCard 
                backgroundUri="https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                index={1}
              />
            ),
            title: "Smart Property Search",
            subtitle: <Subtitle>Filter by location. Find exactly what you're looking for.</Subtitle>,
          },
          {
            backgroundColor: colors.background,
            image: (
              <AnimatedImageCard 
                backgroundUri="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                index={2}
              />
            ),
            title: "How to Use ChumbaConnect",
            subtitle: (
              <Subtitle>
                <FormattedSubtitle text="1. Create your account. Login to explore properties. Browse available rooms with status" />
              </Subtitle>
            ),
          },
          {
            backgroundColor: colors.surface,
            image: (
              <AnimatedImageCard 
                backgroundUri="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                index={3}
              />
            ),
            title: "Property Details & Requests",
            subtitle: (
              <Subtitle>
                <FormattedSubtitle text="• View high-quality images & video walkthroughs• Submit rental requests with your details• Get approved by landlords directly" />
              </Subtitle>
            ),
          },
          {
            backgroundColor: colors.background,
            image: (
              <AnimatedImageCard 
                backgroundUri="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                index={4}
              />
            ),
            title: "Manage Your Rentals",
            subtitle: (
              <Subtitle>
                <FormattedSubtitle text="• Track active rentals in MyRentals• Pay rent securely through the app• View payment receipts and history" />
              </Subtitle>
            ),
          },
          {
            backgroundColor: colors.surface,
            image: (
              <AnimatedImageCard 
                backgroundUri="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                index={5}
              />
            ),
            title: "List Properties & Reviews",
            subtitle: (
              <Subtitle>
                <FormattedSubtitle text="• Landlords: List properties in MyRooms• Share photos and optional video tours• Rate and review your rental experience" />
              </Subtitle>
            ),
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  onboardingContainer: {
    paddingHorizontal: 0,
  },
  imageCardContainer: {
    width: width * 0.85,
    height: height * 0.45,
    marginBottom: 20,
  },
  imageCard: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 29, 41, 0.15)',
  },
  floatingElement: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
  },
  floatingElement1: {
    width: 50,
    height: 50,
    top: 20,
    right: 20,
  },
  floatingElement2: {
    width: 40,
    height: 40,
    bottom: 20,
    left: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
    letterSpacing: -0.5,
    paddingHorizontal: 20,
  },
  subtitleContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 30,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'System',
    letterSpacing: 0.1,
    marginBottom: 4,
    color: '#6B7280',
  },
  additionalLine: {
    marginTop: 6,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    width: '100%',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#7B61FF',
    marginRight: 8,
    marginTop: 1,
    fontWeight: 'bold',
  },
  listText: {
    textAlign: 'left',
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  skipButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 2, // Reduced padding
    minWidth: 0,
  },
  nextButton: {
    backgroundColor: '#7B61FF',
    marginRight: 12,
    paddingHorizontal: 16,
    minWidth: 0,
  },
  doneButton: {
    backgroundColor: '#7B61FF',
    marginRight: 12,
    paddingHorizontal: 16,
    minWidth: 0,
  },
  skipButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
    letterSpacing: 0.2,
    color: '#6B7280',
    paddingVertical: 0, // Reduced padding
  },
  nextButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
    letterSpacing: 0.3,
    paddingVertical: 0, // Reduced padding
  },
  doneButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
    letterSpacing: 0.3,
    paddingVertical: 0, // Reduced padding
  },
  nextButtonContent: {
    paddingHorizontal: 16,
    paddingVertical: 4, // Reduced from 6 to 4
  },
  doneButtonContent: {
    paddingHorizontal: 16,
    paddingVertical: 4, // Reduced from 6 to 4
  },
});