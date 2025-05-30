import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Mail, Briefcase, Award } from 'lucide-react-native';

export default function CreateSpeakerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    company: '',
    bio: '',
    expertise: [] as string[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const expertiseAreas = [
    'Web Development',
    'Mobile Development',
    'AI/ML',
    'Cloud Computing',
    'DevOps',
    'UI/UX Design',
    'Cybersecurity',
    'Blockchain',
    'Data Science',
    'IoT',
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }
    
    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    }
    
    if (formData.expertise.length === 0) {
      newErrors.expertise = 'Select at least one area of expertise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to speakers list
      router.back();
    } catch (error) {
      console.error('Error creating speaker:', error);
      setErrors({
        submit: 'Failed to create speaker. Please try again.',
      });
    }
  };

  const toggleExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter(e => e !== expertise)
        : [...prev.expertise, expertise],
    }));
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[
        styles.formContainer,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}>
        {/* Profile Image Placeholder */}
        <View style={[
          styles.profileImagePlaceholder,
          { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
        ]}>
          <Text style={[
            styles.profileImageInitials,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            {formData.name
              ? formData.name.split(' ').map(n => n[0]).join('')
              : 'Add\nPhoto'}
          </Text>
        </View>
        
        {/* Name */}
        <View style={styles.inputContainer}>
          <Text style={[
            styles.label,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Full Name *
          </Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                color: isDark ? '#FFFFFF' : '#000000',
              }
            ]}
            placeholder="Enter full name"
            placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name}</Text>
          )}
        </View>
        
        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={[
            styles.label,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Email *
          </Text>
          <View style={styles.iconInput}>
            <Mail size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                  color: isDark ? '#FFFFFF' : '#000000',
                }
              ]}
              placeholder="Enter email address"
              placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            />
          </View>
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>
        
        {/* Role and Company */}
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.flex1]}>
            <Text style={[
              styles.label,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Role *
            </Text>
            <View style={styles.iconInput}>
              <Briefcase size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    color: isDark ? '#FFFFFF' : '#000000',
                  }
                ]}
                placeholder="Enter role"
                placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
                value={formData.role}
                onChangeText={(text) => setFormData(prev => ({ ...prev, role: text }))}
              />
            </View>
            {errors.role && (
              <Text style={styles.errorText}>{errors.role}</Text>
            )}
          </View>
          
          <View style={[styles.inputContainer, styles.flex1]}>
            <Text style={[
              styles.label,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Company
            </Text>
            <View style={styles.iconInput}>
              <Award size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    color: isDark ? '#FFFFFF' : '#000000',
                  }
                ]}
                placeholder="Enter company"
                placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
                value={formData.company}
                onChangeText={(text) => setFormData(prev => ({ ...prev, company: text }))}
              />
            </View>
          </View>
        </View>
        
        {/* Bio */}
        <View style={styles.inputContainer}>
          <Text style={[
            styles.label,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Bio *
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { 
                backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                color: isDark ? '#FFFFFF' : '#000000',
              }
            ]}
            placeholder="Enter professional bio"
            placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
            multiline
            numberOfLines={4}
            value={formData.bio}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
          />
          {errors.bio && (
            <Text style={styles.errorText}>{errors.bio}</Text>
          )}
        </View>
        
        {/* Expertise */}
        <View style={styles.inputContainer}>
          <Text style={[
            styles.label,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Areas of Expertise *
          </Text>
          <View style={styles.expertiseContainer}>
            {expertiseAreas.map(expertise => (
              <Pressable
                key={expertise}
                style={[
                  styles.expertiseChip,
                  { 
                    backgroundColor: formData.expertise.includes(expertise)
                      ? '#0A84FF'
                      : isDark ? '#2C2C2E' : '#F2F2F7'
                  }
                ]}
                onPress={() => toggleExpertise(expertise)}
              >
                <Text style={[
                  styles.expertiseChipText,
                  { 
                    color: formData.expertise.includes(expertise)
                      ? '#FFFFFF'
                      : isDark ? '#FFFFFF' : '#000000'
                  }
                ]}>
                  {expertise}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.expertise && (
            <Text style={styles.errorText}>{errors.expertise}</Text>
          )}
        </View>
        
        {errors.submit && (
          <Text style={[styles.errorText, styles.submitError]}>
            {errors.submit}
          </Text>
        )}
        
        {/* Submit Button */}
        <Pressable
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            Create Speaker
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  formContainer: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageInitials: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    flex: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expertiseChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  expertiseChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    marginTop: 4,
  },
  submitError: {
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#0A84FF',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});