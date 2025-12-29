import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome, AntDesign } from '@expo/vector-icons';

interface Doctor {
  _id: string;
  name: string;
  specialization?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  rating?: number;
  reviews?: number;
  experience?: string;
  bio?: string;
  distance?: number;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
}

export default function DoctorDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [doctor, setDoctor] = useState<Doctor>(() => {
    try {
      return params.doctorData ? JSON.parse(params.doctorData as string) : {};
    } catch {
      return {};
    }
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Sample reviews - replace with API call
  const sampleReviews: Review[] = [
    {
      id: '1',
      author: 'Sarah Johnson',
      rating: 5,
      text: 'Dr. Smith is very professional and attentive. Highly recommended!',
      date: '2 weeks ago',
      avatar: '👩‍💼',
    },
    {
      id: '2',
      author: 'Michael Brown',
      rating: 4,
      text: 'Great doctor, very helpful. Wait time was a bit long though.',
      date: '1 month ago',
      avatar: '👨‍💼',
    },
    {
      id: '3',
      author: 'Emily Davis',
      rating: 5,
      text: 'Best experience ever! Dr. Smith explained everything clearly.',
      date: '2 months ago',
      avatar: '👩‍🎓',
    },
  ];

  const handleBookAppointment = () => {
    router.push({
      pathname: '/doctors/book',
      params: { doctorId: doctor._id, doctorName: doctor.name },
    });
  };

  const handleCall = () => {
    Alert.alert('Call Doctor', `Calling ${doctor.phone || 'N/A'}`);
  };

  const handleMessage = () => {
    Alert.alert('Message', `Message sent to ${doctor.name}`);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      'Favorite',
      isFavorite ? `Removed from favorites` : `Added to favorites`
    );
  };

  const handleAddReview = () => {
    Alert.alert('Add Review', 'Share your experience with this doctor');
  };

  const handleShareProfile = () => {
    Alert.alert('Share', `Sharing ${doctor.name}'s profile...`);
  };

  const handleViewAvailability = () => {
    Alert.alert('Schedule', 'Next available slots:\n• Tomorrow at 2:00 PM\n• Thursday at 10:00 AM');
  };

  const handleReportDoctor = () => {
    Alert.alert(
      'Report Doctor',
      'This will be reviewed by our support team',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive' },
      ]
    );
  };

  const renderReviewCard = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerAvatar}>{item.avatar}</Text>
          <View style={styles.reviewerDetails}>
            <Text style={styles.reviewerName}>{item.author}</Text>
            <Text style={styles.reviewDate}>{item.date}</Text>
          </View>
        </View>
        <View style={styles.reviewStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesome
              key={star}
              name={star <= item.rating ? 'star' : 'star-o'}
              size={14}
              color="#FFB800"
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <AntDesign name="arrowleft" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <MaterialIcons name="more-vert" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Doctor Profile Card */}
        <View style={styles.profileCard}>
          {doctor.avatar ? (
            <Image source={{ uri: doctor.avatar }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <FontAwesome name="user-md" size={80} color="#fff" />
            </View>
          )}

          <View style={styles.profileBadge}>
            <MaterialIcons name="verified" size={24} color="#0066CC" />
          </View>

          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorTitle}>
            {doctor.specialization || 'Doctor'}
          </Text>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {doctor.experience || '5+'}
              </Text>
              <Text style={styles.statLabel}>Years Exp</Text>
            </View>
            <View style={[styles.statItem, styles.statDivider]}>
              <Text style={styles.statValue}>
                {doctor.rating || 4.8}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {doctor.reviews || 256}
              </Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={handleCall}
          >
            <MaterialIcons name="phone" size={20} color="#fff" />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={handleMessage}
          >
            <MaterialIcons name="message" size={20} color="#0066CC" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.scheduleButton]}
            onPress={handleViewAvailability}
          >
            <MaterialIcons name="schedule" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={handleToggleFavorite}
          >
            <View style={styles.quickActionIcon}>
              <FontAwesome name={isFavorite ? 'heart' : 'heart-o'} size={24} color={isFavorite ? '#FF0000' : '#0066CC'} />
            </View>
            <Text style={styles.quickActionLabel}>Favorite</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={handleAddReview}
          >
            <View style={styles.quickActionIcon}>
              <MaterialIcons name="rate-review" size={24} color="#FFB800" />
            </View>
            <Text style={styles.quickActionLabel}>Review</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={handleShareProfile}
          >
            <View style={styles.quickActionIcon}>
              <MaterialIcons name="share" size={24} color="#00A86B" />
            </View>
            <Text style={styles.quickActionLabel}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={handleReportDoctor}
          >
            <View style={styles.quickActionIcon}>
              <MaterialIcons name="flag" size={24} color="#FF6B35" />
            </View>
            <Text style={styles.quickActionLabel}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {doctor.bio ||
              'Experienced doctor with 5+ years in medical practice. Specialized in general medicine and patient care. Dedicated to providing quality healthcare services.'}
          </Text>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesContainer}>
            <View style={styles.serviceTag}>
              <MaterialIcons name="verified" size={16} color="#0066CC" />
              <Text style={styles.serviceText}>General Consultation</Text>
            </View>
            <View style={styles.serviceTag}>
              <MaterialIcons name="verified" size={16} color="#0066CC" />
              <Text style={styles.serviceText}>Follow-up Visits</Text>
            </View>
            <View style={styles.serviceTag}>
              <MaterialIcons name="verified" size={16} color="#0066CC" />
              <Text style={styles.serviceText}>Prescription</Text>
            </View>
            <View style={styles.serviceTag}>
              <MaterialIcons name="verified" size={16} color="#0066CC" />
              <Text style={styles.serviceText}>Health Advice</Text>
            </View>
          </View>
        </View>

        {/* Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinic Hours</Text>
          <View style={styles.scheduleContainer}>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>Mon - Fri</Text>
              <Text style={styles.scheduleTime}>9:00 AM - 6:00 PM</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>Saturday</Text>
              <Text style={styles.scheduleTime}>9:00 AM - 1:00 PM</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>Sunday</Text>
              <Text style={styles.scheduleTime}>Closed</Text>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <Text style={styles.reviewCount}>
              {doctor.reviews || 256} reviews
            </Text>
          </View>
          <FlatList
            data={sampleReviews}
            keyExtractor={(item) => item.id}
            renderItem={renderReviewCard}
            scrollEnabled={false}
          />
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactItem}>
            <MaterialIcons name="email" size={20} color="#0066CC" />
            <Text style={styles.contactText}>{doctor.email || 'doctor@email.com'}</Text>
          </View>
          <View style={styles.contactItem}>
            <MaterialIcons name="phone" size={20} color="#0066CC" />
            <Text style={styles.contactText}>{doctor.phone || '+1 (555) 123-4567'}</Text>
          </View>
          <View style={styles.contactItem}>
            <MaterialIcons name="location-on" size={20} color="#0066CC" />
            <Text style={styles.contactText}>Medical Center, City Hospital</Text>
          </View>
        </View>
      </ScrollView>

      {/* Book Appointment Button */}
      <View style={styles.bookingFooter}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookAppointment}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileBadge: {
    position: 'absolute',
    top: 120,
    right: '35%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  doctorTitle: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: '#EEE',
    borderRightWidth: 1,
    borderRightColor: '#EEE',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#0066CC',
  },
  callButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  messageButton: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1.5,
    borderColor: '#0066CC',
  },
  messageButtonText: {
    color: '#0066CC',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  servicesContainer: {
    gap: 8,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    gap: 8,
  },
  serviceText: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: '500',
  },
  scheduleContainer: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  scheduleDay: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  scheduleTime: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: '500',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewCount: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  reviewerAvatar: {
    fontSize: 32,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  bookingFooter: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  bookButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  scheduleButton: {
    backgroundColor: '#00A86B',
    paddingHorizontal: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionIcon: {
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});
