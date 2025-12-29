import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { appointmentsAPI } from '../../utils/api';
import { storageService } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function BookDoctorAppointmentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const doctorId = params.doctorId as string;
  const doctorName = params.doctorName as string;

  const [currentStep, setCurrentStep] = useState<'date' | 'time' | 'details' | 'confirm'>(
    'date'
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [appointmentType, setAppointmentType] = useState<'consultation' | 'followup'>(
    'consultation'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'spanish' | 'hindi'>('english');
  const [preferredContact, setPreferredContact] = useState<'phone' | 'email' | 'sms'>('phone');
  const [enableReminders, setEnableReminders] = useState(true);

  const timeSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
  ];

  const reasons = [
    { id: 1, label: 'General Checkup', icon: '🏥' },
    { id: 2, label: 'Fever & Flu', icon: '🤒' },
    { id: 3, label: 'Chest Pain', icon: '💔' },
    { id: 4, label: 'Headache', icon: '🤕' },
    { id: 5, label: 'Stomach Issues', icon: '🤢' },
    { id: 6, label: 'Other', icon: '📋' },
  ];

  const handleDateChange = (event: any, date: any) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  };

  const handleNextStep = () => {
    if (currentStep === 'date') {
      if (selectedDate < new Date()) {
        Alert.alert('Invalid Date', 'Please select a future date');
        return;
      }
      setCurrentStep('time');
    } else if (currentStep === 'time') {
      if (!selectedTime) {
        Alert.alert('Select Time', 'Please select a time slot');
        return;
      }
      setCurrentStep('details');
    } else if (currentStep === 'details') {
      if (!reason) {
        Alert.alert('Select Reason', 'Please select reason for visit');
        return;
      }
      setCurrentStep('confirm');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'time') setCurrentStep('date');
    else if (currentStep === 'details') setCurrentStep('time');
    else if (currentStep === 'confirm') setCurrentStep('details');
  };

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(
        parseInt(selectedTime.split(':')[0]),
        parseInt(selectedTime.split(':')[1])
      );

      const appointmentData = {
        professionalId: doctorId,
        appointmentDate: appointmentDate.toISOString(),
        timeSlot: selectedTime,
        reason: reason,
        notes: notes,
        type: appointmentType,
      };

      const res = await appointmentsAPI.bookAppointment(appointmentData);
      const savedAppointment = res?.data || appointmentData;

      try {
        await storageService.appendAppointment({
          ...(savedAppointment || {}),
          _id: savedAppointment?._id || `${Date.now()}`,
          status: savedAppointment?.status || 'scheduled',
          doctorName: doctorName,
        });
      } catch (e) {
        console.log('Storage error (non-critical):', e);
      }

      Alert.alert(
        'Success!',
        'Your appointment has been booked successfully',
        [
          {
            text: 'View Details',
            onPress: () => router.push('/appointments'),
          },
          {
            text: 'Home',
            onPress: () => router.push('/(tabs)/'),
          },
        ]
      );
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'date':
        return 'Select Date';
      case 'time':
        return 'Select Time';
      case 'details':
        return 'Appointment Details';
      case 'confirm':
        return 'Confirm Booking';
      default:
        return '';
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {['date', 'time', 'details', 'confirm'].map((step, index) => (
        <View key={step} style={{ flex: 1, alignItems: 'center' }}>
          <View
            style={[
              styles.stepDot,
              ['date', 'time', 'details', 'confirm'].indexOf(currentStep) >= index &&
                styles.stepDotActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                ['date', 'time', 'details', 'confirm'].indexOf(currentStep) >= index &&
                  styles.stepNumberActive,
              ]}
            >
              {index + 1}
            </Text>
          </View>
          {index < 3 && (
            <View
              style={[
                styles.stepLine,
                ['date', 'time', 'details', 'confirm'].indexOf(currentStep) > index &&
                  styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="arrowleft" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Doctor Info Card */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorCardContent}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#0066CC',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <FontAwesome name="user-md" size={32} color="#fff" />
            </View>
            <View>
              <Text style={styles.doctorCardName}>{doctorName}</Text>
              <Text style={styles.doctorCardSpecialty}>Doctor Appointment</Text>
            </View>
          </View>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Title */}
        <Text style={styles.stepTitle}>{getStepTitle()}</Text>

        {/* Step Content */}
        <View style={styles.stepContent}>
          {currentStep === 'date' && (
            <>
              <TouchableOpacity
                style={styles.dateDisplay}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialIcons name="calendar-today" size={24} color="#0066CC" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.dateLabel}>Selected Date</Text>
                  <Text style={styles.dateValue}>
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.subSectionTitle}>Or pick another date</Text>

              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                  <TouchableOpacity
                    style={styles.datePickerClose}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerCloseText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {currentStep === 'time' && (
            <>
              <View style={styles.timeGrid}>
                {timeSlots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlotButton,
                      selectedTime === time && styles.timeSlotButtonActive,
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        selectedTime === time && styles.timeSlotTextActive,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {currentStep === 'details' && (
            <>
              {/* Appointment Type */}
              <Text style={styles.sectionLabel}>Appointment Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    appointmentType === 'consultation' && styles.typeButtonActive,
                  ]}
                  onPress={() => setAppointmentType('consultation')}
                >
                  <MaterialIcons
                    name="videocam"
                    size={20}
                    color={appointmentType === 'consultation' ? '#fff' : '#0066CC'}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      appointmentType === 'consultation' && styles.typeButtonTextActive,
                    ]}
                  >
                    Consultation
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    appointmentType === 'followup' && styles.typeButtonActive,
                  ]}
                  onPress={() => setAppointmentType('followup')}
                >
                  <MaterialIcons
                    name="assignment"
                    size={20}
                    color={appointmentType === 'followup' ? '#fff' : '#0066CC'}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      appointmentType === 'followup' && styles.typeButtonTextActive,
                    ]}
                  >
                    Follow-up
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Reason for Visit */}
              <Text style={styles.sectionLabel}>Reason for Visit</Text>
              <View style={styles.reasonGrid}>
                {reasons.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.reasonButton,
                      reason === r.label && styles.reasonButtonActive,
                    ]}
                    onPress={() => setReason(r.label)}
                  >
                    <Text style={styles.reasonIcon}>{r.icon}</Text>
                    <Text
                      style={[
                        styles.reasonText,
                        reason === r.label && styles.reasonTextActive,
                      ]}
                      numberOfLines={2}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Additional Notes */}
              <Text style={styles.sectionLabel}>Additional Notes</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Describe your symptoms or concerns..."
                placeholderTextColor="#999"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Language Preference */}
              <Text style={styles.sectionLabel}>Preferred Language</Text>
              <View style={styles.languageContainer}>
                {['english', 'spanish', 'hindi'].map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.languageButton,
                      selectedLanguage === lang && styles.languageButtonActive,
                    ]}
                    onPress={() => setSelectedLanguage(lang as any)}
                  >
                    <Text
                      style={[
                        styles.languageText,
                        selectedLanguage === lang && styles.languageTextActive,
                      ]}
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Contact Preference */}
              <Text style={styles.sectionLabel}>Preferred Contact Method</Text>
              <View style={styles.contactMethodContainer}>
                {[
                  { id: 'phone', label: 'Phone', icon: 'phone' },
                  { id: 'email', label: 'Email', icon: 'email' },
                  { id: 'sms', label: 'SMS', icon: 'message' },
                ].map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.contactMethodButton,
                      preferredContact === method.id && styles.contactMethodButtonActive,
                    ]}
                    onPress={() => setPreferredContact(method.id as any)}
                  >
                    <MaterialIcons
                      name={method.icon as any}
                      size={18}
                      color={preferredContact === method.id ? '#fff' : '#0066CC'}
                    />
                    <Text
                      style={[
                        styles.contactMethodText,
                        preferredContact === method.id && styles.contactMethodTextActive,
                      ]}
                    >
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Reminders */}
              <View style={styles.reminderContainer}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionLabel}>Appointment Reminders</Text>
                  <Text style={styles.reminderSubtext}>Get notifications before your appointment</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleButton, enableReminders && styles.toggleButtonActive]}
                  onPress={() => setEnableReminders(!enableReminders)}
                >
                  <View style={[styles.toggleCircle, enableReminders && styles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>
            </>
          )}

          {currentStep === 'confirm' && (
            <>
              <View style={styles.confirmCard}>
                <View style={styles.confirmRow}>
                  <MaterialIcons name="event" size={20} color="#0066CC" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.confirmLabel}>Date & Time</Text>
                    <Text style={styles.confirmValue}>
                      {selectedDate.toLocaleDateString()} at {selectedTime}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.confirmRow}>
                  <MaterialIcons name="assignment" size={20} color="#0066CC" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.confirmLabel}>Appointment Type</Text>
                    <Text style={styles.confirmValue}>
                      {appointmentType === 'consultation' ? 'Consultation' : 'Follow-up'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.confirmRow}>
                  <MaterialIcons name="description" size={20} color="#0066CC" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.confirmLabel}>Reason</Text>
                    <Text style={styles.confirmValue}>{reason}</Text>
                  </View>
                </View>

                {notes && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.confirmRow}>
                      <MaterialIcons name="note" size={20} color="#0066CC" />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.confirmLabel}>Notes</Text>
                        <Text style={styles.confirmValue}>{notes}</Text>
                      </View>
                    </View>
                  </>
                )}

                <View style={styles.divider} />

                <View style={styles.confirmRow}>
                  <MaterialIcons name="language" size={20} color="#0066CC" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.confirmLabel}>Preferred Language</Text>
                    <Text style={styles.confirmValue}>
                      {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.confirmRow}>
                  <MaterialIcons
                    name={
                      preferredContact === 'phone'
                        ? 'phone'
                        : preferredContact === 'email'
                          ? 'email'
                          : 'message'
                    }
                    size={20}
                    color="#0066CC"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.confirmLabel}>Preferred Contact</Text>
                    <Text style={styles.confirmValue}>
                      {preferredContact === 'sms' ? 'SMS' : preferredContact.charAt(0).toUpperCase() + preferredContact.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.confirmRow}>
                  <MaterialIcons
                    name={enableReminders ? 'notifications-active' : 'notifications-off'}
                    size={20}
                    color={enableReminders ? '#00A86B' : '#999'}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.confirmLabel}>Appointment Reminders</Text>
                    <Text style={styles.confirmValue}>
                      {enableReminders ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.confirmInfo}>
                ℹ️ A confirmation will be sent to your registered email and phone number.
              </Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {currentStep !== 'date' && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handlePreviousStep}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, currentStep === 'date' && { marginLeft: 0 }]}
          onPress={
            currentStep === 'confirm' ? handleConfirmBooking : handleNextStep
          }
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {currentStep === 'confirm' ? 'Confirm Booking' : 'Next'}
            </Text>
          )}
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  doctorCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  doctorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  doctorCardSpecialty: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: '500',
    marginTop: 2,
  },
  stepIndicator: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#0066CC',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#E5E7EB',
    top: 20,
  },
  stepLineActive: {
    backgroundColor: '#0066CC',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  stepContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#0066CC',
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '700',
    marginTop: 2,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  datePickerClose: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    alignItems: 'center',
  },
  datePickerCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlotButton: {
    width: (width - 60) / 3,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  timeSlotButtonActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  timeSlotTextActive: {
    color: '#fff',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0066CC',
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066CC',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  reasonButton: {
    width: (width - 60) / 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    gap: 6,
  },
  reasonButtonActive: {
    borderColor: '#0066CC',
    backgroundColor: '#F0F7FF',
  },
  reasonIcon: {
    fontSize: 24,
  },
  reasonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  reasonTextActive: {
    color: '#0066CC',
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    fontFamily: 'System',
    marginBottom: 20,
  },
  confirmCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  confirmRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  confirmLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  confirmValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  confirmInfo: {
    fontSize: 13,
    color: '#0066CC',
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  languageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066CC',
  },
  languageTextActive: {
    color: '#fff',
  },
  contactMethodContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  contactMethodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  contactMethodButtonActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  contactMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066CC',
  },
  contactMethodTextActive: {
    color: '#fff',
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f7ff',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0e4ff',
    marginBottom: 24,
  },
  reminderSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#00A86B',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
});
