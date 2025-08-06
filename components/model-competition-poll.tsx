'use client';

import React, { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase';

interface Church {
  id: number;
  name: string;
  access_code: string;
  is_registered: boolean;
}

interface Topic {
  id: number;
  name: string;
  total_limit: number;
  current_count: number;
  is_active: boolean;
}

interface FormData {
  churchId: string;
  topicId: string;
  leaderName: string;
  email: string;
  accessCode: string;
}

const TalentFiestaPage: React.FC = () => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [formData, setFormData] = useState<FormData>({
    churchId: '',
    topicId: '',
    leaderName: '',
    email: '',
    accessCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch churches and topics on component mount
  useEffect(() => {
    fetchChurches();
    fetchTopics();
  }, []);

  const fetchChurches = async () => {
    try {
      const { data, error } = await supabaseBrowser
        .from('churches_talent_fiesta2025')
        .select('*')
        .eq('is_registered', false)
        .order('name');

      if (error) {
        console.error('Churches fetch error:', error);
        throw error;
      }
      setChurches(data || []);
    } catch (error: any) {
      console.error('Error fetching churches:', error);
      setMessage({
        type: 'error',
        text: `Failed to load churches: ${error.message || 'Unknown error'}`
      });
    }
  };

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabaseBrowser
        .from('topics')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Topics fetch error:', error);
        throw error;
      }
      setTopics(data || []);
    } catch (error: any) {
      console.error('Error fetching topics:', error);
      setMessage({
        type: 'error',
        text: `Failed to load topics: ${error.message || 'Unknown error'}`
      });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.churchId) {
      setMessage({ type: 'error', text: 'Please select a church' });
      return false;
    }
    if (!formData.topicId) {
      setMessage({ type: 'error', text: 'Please select a topic' });
      return false;
    }
    if (!formData.leaderName.trim()) {
      setMessage({ type: 'error', text: 'Please enter leader name' });
      return false;
    }
    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Please enter email address' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return false;
    }
    if (!formData.accessCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter access code' });
      return false;
    }
    if (formData.accessCode.length !== 4) {
      setMessage({ type: 'error', text: 'Access code must be 4 digits' });
      return false;
    }
    return true;
  };

  const sendConfirmationEmail = async (email: string, churchName: string, topicName: string) => {
    try {
      const response = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          churchName,
          topicName,
          leaderName: formData.leaderName
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Email service error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
    } catch (error: any) {
      console.error('Error sending email:', error);
      // Don't fail the registration if email fails, but log the specific error
      console.warn('Email sending failed but registration will continue:', error.message);
    }
  };

  const getErrorMessage = (error: any): string => {
    if (!error) return 'Unknown error occurred';

    // Handle Supabase specific errors
    if (error.code) {
      switch (error.code) {
        case '23505': // Unique constraint violation
          if (error.message.includes('registrations_talent_fiesta2025_church_id_topic_id_key')) {
            return 'This church has already registered for this topic';
          }
          return 'Duplicate entry detected';
        case '23503': // Foreign key constraint
          return 'Invalid church or topic selection';
        case '23514': // Check constraint
          return 'Invalid data provided';
        case 'PGRST116': // No rows returned
          return 'Record not found';
        default:
          return `Database error (${error.code}): ${error.message}`;
      }
    }

    // Handle network errors
    if (error.message) {
      if (error.message.includes('fetch')) {
        return 'Network connection error. Please check your internet connection.';
      }
      if (error.message.includes('timeout')) {
        return 'Request timeout. Please try again.';
      }
      return error.message;
    }

    return 'An unexpected error occurred';
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Starting registration process...');

      // Step 1: Verify access code and church availability
      console.log('Verifying access code for church ID:', formData.churchId);
      const { data: churchData, error: churchError } = await supabaseBrowser
        .from('churches_talent_fiesta2025')
        .select('*')
        .eq('id', formData.churchId)
        .eq('access_code', formData.accessCode)
        .eq('is_registered', false)
        .single();

      if (churchError) {
        console.error('Church verification error:', churchError);
        if (churchError.code === 'PGRST116') {
          setMessage({ type: 'error', text: 'Invalid access code or church is already registered' });
        } else {
          setMessage({ type: 'error', text: `Church verification failed: ${getErrorMessage(churchError)}` });
        }
        return;
      }

      if (!churchData) {
        setMessage({ type: 'error', text: 'Invalid access code or church already registered' });
        return;
      }

      console.log('Church verified successfully:', churchData.name);

      // Step 2: Check topic availability
      console.log('Checking topic availability for topic ID:', formData.topicId);
      const { data: topicData, error: topicError } = await supabaseBrowser
        .from('topics')
        .select('*')
        .eq('id', formData.topicId)
        .single();

      if (topicError) {
        console.error('Topic verification error:', topicError);
        setMessage({ type: 'error', text: `Topic verification failed: ${getErrorMessage(topicError)}` });
        return;
      }

      if (!topicData) {
        setMessage({ type: 'error', text: 'Selected topic not found' });
        return;
      }

      if (topicData.current_count >= topicData.total_limit) {
        setMessage({ type: 'error', text: 'Sorry, this topic is now full. Please select another topic.' });
        await fetchTopics(); // Refresh topics to show updated availability
        return;
      }

      console.log('Topic verified successfully:', topicData.name);

      // Step 3: Check for duplicate registration
      console.log('Checking for existing registration...');
      const { data: existingReg, error: existingRegError } = await supabaseBrowser
        .from('registrations_talent_fiesta2025')
        .select('id')
        .eq('church_id', parseInt(formData.churchId))
        .eq('topic_id', parseInt(formData.topicId))
        .maybeSingle();

      if (existingRegError) {
        console.error('Duplicate check error:', existingRegError);
        setMessage({ type: 'error', text: `Duplicate check failed: ${getErrorMessage(existingRegError)}` });
        return;
      }

      if (existingReg) {
        setMessage({ type: 'error', text: 'This church has already registered for this topic' });
        return;
      }

      // Step 4: Create registration
      console.log('Creating registration...');
      const registrationData = {
        church_id: parseInt(formData.churchId),
        topic_id: parseInt(formData.topicId),
        leader_name: formData.leaderName.trim(),
        email: formData.email.trim()
      };

      const { data: newRegistration, error: registrationError } = await supabaseBrowser
        .from('registrations_talent_fiesta2025')
        .insert([registrationData])
        .select()
        .single();

      if (registrationError) {
        console.error('Registration creation error:', registrationError);
        setMessage({ type: 'error', text: `Registration failed: ${getErrorMessage(registrationError)}` });
        return;
      }

      console.log('Registration created successfully:', newRegistration);

      // Step 5: Update church status
      console.log('Updating church registration status...');
      const { error: churchUpdateError } = await supabaseBrowser
        .from('churches_talent_fiesta2025')
        .update({ is_registered: true })
        .eq('id', formData.churchId);

      if (churchUpdateError) {
        console.error('Church update error:', churchUpdateError);
        // Don't fail the registration for this, but log it
        console.warn('Church status update failed, but registration was successful');
      }

      // Step 6: Update topic count
      console.log('Updating topic count...');
      const { error: topicUpdateError } = await supabaseBrowser
        .from('topics')
        .update({ current_count: topicData.current_count + 1 })
        .eq('id', formData.topicId);

      if (topicUpdateError) {
        console.error('Topic count update error:', topicUpdateError);
        // Don't fail the registration for this, but log it
        console.warn('Topic count update failed, but registration was successful');
      }

      // Step 7: Send confirmation email
      console.log('Sending confirmation email...');
      await sendConfirmationEmail(formData.email, churchData.name, topicData.name);

      // Success!
      setMessage({
        type: 'success',
        text: `Registration successful! ${churchData.name} has been registered for ${topicData.name}. Confirmation email sent to ${formData.email}`
      });

      // Reset form
      setFormData({
        churchId: '',
        topicId: '',
        leaderName: '',
        email: '',
        accessCode: ''
      });

      // Refresh data
      console.log('Refreshing data...');
      await Promise.all([fetchChurches(), fetchTopics()]);

    } catch (error: any) {
      console.error('Unexpected registration error:', error);
      setMessage({
        type: 'error',
        text: `Unexpected error: ${getErrorMessage(error)}. Please try again or contact support.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (message.type === 'error') {
      setMessage({ type: '', text: '' });
    }
  };

  const isTopicAvailable = (topic: Topic) => {
    return topic.current_count < topic.total_limit;
  };

  const getAvailableChurches = () => {
    return churches.filter(church => !church.is_registered);
  };

  return (
    <div className="min-h-screen bg-white text-red-700">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold">DYFC Bombay Talent Fiesta 2025</h1>
            </div>
            <h2 className="text-xl font-semibold mb-2">Model Making Event</h2>
            <p className="text-red-600">Choose the topic for the model making competition!</p>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
              }`}>
              <div className="w-5 h-5 flex-shrink-0">
                {message.type === 'error' ? '⚠️' : '✅'}
              </div>
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Registration Form */}
          <div className="bg-white border-2 border-red-200 rounded-lg p-6 shadow-lg">
            <div className="space-y-6">
              {/* Church Selection */}
              <div>
                <label htmlFor="church" className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="text-red-700">⛪</span>
                  Select Church
                </label>
                <select
                  id="church"
                  value={formData.churchId}
                  onChange={(e) => handleInputChange('churchId', e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={isSubmitting}
                >
                  <option value="">Choose your church...</option>
                  {getAvailableChurches().map((church) => (
                    <option key={church.id} value={church.id}>
                      {church.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Selection */}
              <div>
                <label htmlFor="topic" className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="text-red-700">🏆</span>
                  Select Topic
                </label>
                <select
                  id="topic"
                  value={formData.topicId}
                  onChange={(e) => handleInputChange('topicId', e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={isSubmitting}
                >
                  <option value="">Choose a topic...</option>
                  {topics.map((topic) => (
                    <option
                      key={topic.id}
                      value={topic.id}
                      title={topic.name} // Full description in tooltip!
                      disabled={!isTopicAvailable(topic)}
                      className={!isTopicAvailable(topic) ? 'text-gray-400' : ''}
                    >
                      {topic.name.length > 60
                        ? topic.name.slice(0, 60) + '...'
                        : topic.name
                      }
                      ({topic.current_count}/{topic.total_limit}) {!isTopicAvailable(topic) ? '(Full)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leader Name */}
              <div>
                <label htmlFor="leaderName" className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="text-red-700">👤</span>
                  Leader Name
                </label>
                <input
                  type="text"
                  id="leaderName"
                  value={formData.leaderName}
                  onChange={(e) => handleInputChange('leaderName', e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter leader's name"
                  disabled={isSubmitting}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="text-red-700">✉️</span>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter email address"
                  disabled={isSubmitting}
                />
              </div>

              {/* Access Code */}
              <div>
                <label htmlFor="accessCode" className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="text-red-700">🔑</span>
                  Access Code
                </label>
                <input
                  type="text"
                  id="accessCode"
                  value={formData.accessCode}
                  onChange={(e) => handleInputChange('accessCode', e.target.value.slice(0, 4))}
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter 4-digit access code"
                  maxLength={4}
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-red-700 text-white py-3 px-4 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registering...
                  </>
                ) : (
                  'Register for Event'
                )}
              </button>
            </div>
          </div>

          {/* Available Topics Display */}
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-red-800">Available Topics:</h3>
            <div className="space-y-2">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`flex justify-between items-center p-2 rounded ${isTopicAvailable(topic)
                    ? 'bg-white border border-red-200'
                    : 'bg-gray-100 border border-gray-300 text-gray-500'
                    }`}
                >
                  <span className="font-medium">{topic.name}</span>
                  <span className="text-sm">
                    {topic.current_count}/{topic.total_limit} - {isTopicAvailable(topic) ? 'Available' : 'Full'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentFiestaPage;