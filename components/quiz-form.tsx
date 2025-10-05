'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Checkbox
} from '@/components/ui/checkbox';
import {
  Calendar
} from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  ChevronDownIcon,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Button
} from '@/components/ui/button';
import {
  Input
} from '@/components/ui/input';
import {
  Label
} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription
} from '@/components/ui/alert';
import {
  Separator
} from '@/components/ui/separator';
import {
  Badge
} from '@/components/ui/badge';
import {
  BookOpen,
  Users,
  Church,
  MapPin,
  Phone,
  Mail,
  Crown,
  Star,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader2,
  Cross,
  Sparkles,
  Shield,
  Download,
  Send
} from 'lucide-react';
import { Combobox } from "@headlessui/react";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

interface Participant {
  name: string;
  gender: string;
  dob: string;
  mobileNo: string;
}

interface FormData {
  groupLeaderName: string;
  church: string;
  location: string;
  langOfQuiz: string;
  zone: string;
  contactNo: string;
  alternateNo: string;
  mailId: string;
  participants: Participant[];
}

const BibleQuizRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    groupLeaderName: '',
    church: '',
    location: '',
    langOfQuiz: '',
    zone: '',
    contactNo: '',
    alternateNo: '',
    mailId: '',
    participants: Array(8).fill(null).map(() => ({
      name: '',
      gender: '',
      dob: '',
      mobileNo: ''
    }))
  });

  const [verificationEmail, setVerificationEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const churches = [
    "Bethany Church, Mira Road",
    "Church of Brethren, Dahanu Road",
    "CNI Marathi Congregation, Virar",
    "Emmanuel Mar. Church, Vasai",
    "Holy Immanuel Church (CNI), Vasai",
    "St. James Tamil Church, Boisar",
    "St. Matthew's Tamil Church, Virar",
    "St. Peter's Church, Palghar",
    "Wada Church",
    "All Saints Church, Govandi",
    "Holy Trinity Church, Chembur",
    "Bethel Church Tamil, Chembur",
    "Govandi Church",
    "Jubilee Cong. (Eng.)",
    "Jubilee Malayalam Church",
    "Jubilee Marathi Church",
    "Jubilee Tamil Church",
    "St.Philip's Tamil Church, CNI. Vasai",
    "Khrista Prakash Church",
    "St. Francis Church (Old)",
    "St. Francis Church (New)",
    "St. Matthias' Tamil Church, CNI",
    "St. Francis Church (Tamil)",
    "Christ Church (Tamil), Poisar",
    "Ambroli Gujarathi Church, Vile Parle",
    "CNI Andheri English Congregation",
    "Emmanuel Tamil Church, Orlem, Malad",
    "Holy Jerusalem Church, Andheri",
    "Holy Redeemer Church, Vile Parle",
    "Holy Trinity Church, Bhagatsingh Nagar",
    "Pandita Ramabai Church, Goregaon",
    "St. Andrew's Tamil, Kandivili",
    "St. James Mal. Church, Borivali",
    "St. John Tamil Church, Goregaon",
    "St. Paul's Malayalam Church, Vakola",
    "St. Stephen's Church, Bandra",
    "Ambroli Marathi Church, Girgaum",
    "All Saints Church, Malabar Hill",
    "Bombay Telugu Church, Mazagaon",
    "Christ Church CNI, Byculla",
    "Emmanuel Gujarathi Church, Grant Road",
    "Emmanuel Mar. Church, Grant Road",
    "Holy Cross Church, Umerkhadi",
    "Hume Memorial Church, Byculla",
    "St. Andrew's Marathi Church",
    "St. Paul's Tamil Church, Byculla",
    "St. Thomas Cathedral",
    "Wesley Church, CNI",
    "St. John The Evangelist Church",
    "Church of St. Mary The Virgin (Eng)",
    "Church of St. Mary The Virgin (Mal.)",
    "Church of The Holy Redeemer, Dadar",
    "Good Shepherd Church, Dharavi",
    "Grace Church, Sion - Koliwada",
    "Holy Nativity Church, Matunga",
    "St. Michael And All Angels Church, Kurla",
    "St. Paul's Marathi Church, Matunga",
    "Worli Church",
    "St. Christopher's Mal. Church",
    "St. Christopher's Marathi Church, Kalyan",
    "St. Paul's Tamil Church, Dombivli",
    "St. Peter's Tamil Church, Bhiwandi",
    "St. Thomas Church, Ambernath",
    "St. Luke's Tamil Church, Vithalwadi",
    "Home of Faith Tamil Church CNI",
    "Mulund Marathi Mandali",
    "St. James Church, Thane",
    "Vikhroli Church, CNI",
    "St. Mark's Tamil Church, Vikhroli",
    "St. Peter's Tamil Church, Mulund",
    "St. Stephen's Tamil Church, Bhandup",
    "St. Thomas Tamil Church, Airoli",
    "The Church of Righteousness, Thane"
  ];

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredChurches = query === "" ? churches : churches.filter((church) =>
    church.toLowerCase().includes(query.toLowerCase())
  );

  // Auto-populate first participant with group leader info
  React.useEffect(() => {
    if (formData.groupLeaderName.trim() && formData.contactNo.trim()) {
      const newParticipants = [...formData.participants];
      newParticipants[0] = {
        ...newParticipants[0],
        name: formData.groupLeaderName,
        mobileNo: formData.contactNo
      };
      setFormData(prev => ({ ...prev, participants: newParticipants }));
    }
  }, [formData.groupLeaderName, formData.contactNo]);

  // Initialize verification email with form email when form email changes
  React.useEffect(() => {
    if (formData.mailId && !verificationEmail) {
      setVerificationEmail(formData.mailId);
    }
  }, [formData.mailId, verificationEmail]);

  const sendOtp = async () => {
    if (!verificationEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter email address for verification' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verificationEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setOtpLoading(true);
    setMessage({ type: '', text: '' });
    setOtpError('');

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send OTP');
      }

      setGeneratedOtp(result.otp);
      setIsOtpSent(true);
      setOtpAttempts(0);
      setMessage({ type: 'success', text: 'OTP sent successfully to your email!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send OTP' });
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = () => {
    if (!otp.trim()) {
      setOtpError('Please enter the OTP');
      setMessage({ type: 'error', text: 'Please enter the OTP' });
      return;
    }

    if (otp.length !== 6) {
      setOtpError('OTP must be 6 digits');
      setMessage({ type: 'error', text: 'OTP must be 6 digits' });
      return;
    }

    if (otp === generatedOtp) {
      setIsOtpVerified(true);
      setOtpError('');
      setMessage({ type: 'success', text: 'OTP verified successfully!' });
    } else {
      const newAttempts = otpAttempts + 1;
      setOtpAttempts(newAttempts);

      if (newAttempts >= 3) {
        setOtpError('Too many incorrect attempts. Please request a new OTP.');
        setMessage({ type: 'error', text: 'Too many incorrect attempts. Please request a new OTP.' });
        setIsOtpSent(false);
        setOtp('');
        setGeneratedOtp('');
        setOtpAttempts(0);
      } else {
        const remainingAttempts = 3 - newAttempts;
        setOtpError(`Incorrect OTP. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`);
        setMessage({
          type: 'error',
          text: `Incorrect OTP. You have ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`
        });
        setOtp(''); // Clear the input for retry
      }
    }
  };

  const validateForm = (): boolean => {
    // Basic validations
    const requiredFields = [
      { field: 'groupLeaderName', label: 'Group leader name' },
      { field: 'church', label: 'Church name' },
      { field: 'location', label: 'Location' },
      { field: 'langOfQuiz', label: 'Language of quiz' },
      { field: 'zone', label: 'Zone' },
      { field: 'contactNo', label: 'Contact number' },
      { field: 'mailId', label: 'Email address' }
    ];

    if (!declarationAccepted) {
      setMessage({ type: 'error', text: 'Please accept the declaration to proceed' });
      return false;
    }

    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof FormData] || !String(formData[field as keyof FormData]).trim()) {
        setMessage({ type: 'error', text: `Please enter ${label}` });
        return false;
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mailId)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return false;
    }

    if (!isOtpVerified) {
      setMessage({ type: 'error', text: 'Please verify your email address with OTP' });
      return false;
    }

    // Check if at least 2 participants are filled (minimum team size)
    const filledParticipants = formData.participants.filter(p => p.name.trim());
    if (filledParticipants.length < 2) {
      setMessage({ type: 'error', text: 'Minimum 2 participants are required for a team' });
      return false;
    }

    // Validate filled participants
    for (let i = 0; i < formData.participants.length; i++) {
      const participant = formData.participants[i];
      if (participant.name.trim()) {
        if (!participant.gender) {
          setMessage({ type: 'error', text: `Please select gender for participant ${i + 1}` });
          return false;
        }
        if (!participant.dob) {
          setMessage({ type: 'error', text: `Please enter date of birth for participant ${i + 1}` });
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Filter out empty participants
      const activeParticipants = formData.participants.filter(p => p.name.trim());

      const registrationData = {
        ...formData,
        participants: activeParticipants,
        verificationEmail
      };

      const response = await fetch('/api/bible-quiz-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      setMessage({
        type: 'success',
        text: `Registration successful! Group Number: ${result.groupNumber}. Confirmation details and PDF have been sent to ${formData.mailId}. Please print the form, get proper signature and stamp from your priest, and mail it to cni.bdyfc@gmail.com`
      });

      // Reset form
      setFormData({
        groupLeaderName: '',
        church: '',
        location: '',
        langOfQuiz: '',
        zone: '',
        contactNo: '',
        alternateNo: '',
        mailId: '',
        participants: Array(8).fill(null).map(() => ({
          name: '',
          gender: '',
          dob: '',
          mobileNo: ''
        }))
      });

      // Reset verification states
      setVerificationEmail('');
      setOtp('');
      setGeneratedOtp('');
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtpAttempts(0);
      setOtpError('');

    } catch (error: any) {
      console.error('Registration error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Registration failed. Please try again.'
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

  const handleParticipantChange = (index: number, field: keyof Participant, value: string) => {
    const newParticipants = [...formData.participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setFormData(prev => ({ ...prev, participants: newParticipants }));

    if (message.type === 'error') {
      setMessage({ type: '', text: '' });
    }
  };

  const filledParticipantCount = formData.participants.filter(p => p.name.trim()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-4 sm:left-10 text-red-200 opacity-20">
          <Cross size={80} className="sm:w-[120px] sm:h-[120px]" />
        </div>
        <div className="absolute bottom-32 sm:bottom-40 left-8 sm:left-20 text-red-200 opacity-20">
          <BookOpen size={60} className="sm:w-[80px] sm:h-[80px]" />
        </div>
        <div className="absolute bottom-16 sm:bottom-20 right-8 sm:right-40 text-red-200 opacity-15">
          <Heart size={70} className="sm:w-[90px] sm:h-[90px]" />
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8 relative">
        <div className="max-w-7xl mx-auto">

          {/* Stunning Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="relative mb-6 sm:mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-red-400 to-rose-500 rounded-full opacity-20 blur-xl"></div>
              </div>
              <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-full shadow-lg">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 via-rose-600 to-red-800 bg-clip-text text-transparent text-center">
                  BDYFC Bible Quiz 2025
                </h1>
                <div className="p-2 sm:p-3 bg-gradient-to-r from-rose-500 to-red-500 rounded-full shadow-lg">
                  <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4 px-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
              <p className="text-base sm:text-xl font-medium text-gray-700 text-center">
                "Let the word of Christ dwell in you richly in all wisdom"
              </p>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
            </div>
            <p className="text-gray-600 text-sm sm:text-lg">Colossians 3:16</p>
          </div>

          {/* Message Display */}
          {message.text && (
            <Alert className={`mb-6 sm:mb-8 border-2 ${message.type === 'error'
              ? 'border-red-300 bg-red-50 text-red-700'
              : 'border-green-200 bg-green-50 text-green-700'
              }`}>
              <div className="flex items-center gap-2">
                {message.type === 'error' ?
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> :
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                }
                <AlertDescription className="text-xs sm:text-sm font-medium">
                  {message.text}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Registration Form */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-t-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold">Registration Form</CardTitle>
                  <CardDescription className="text-red-100 text-sm sm:text-base">
                    Fill in your details to participate in the BDYFC Bible Quiz 2025
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 lg:p-8">

              {/* Instructions Section */}
              <Card className="mb-6 sm:mb-8 border border-red-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="p-2 bg-red-600 rounded-lg">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-red-900">Important Instructions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 sm:p-6 rounded-lg border border-red-200">
                    <ul className="space-y-2 sm:space-y-3 text-red-800 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mt-1 flex-shrink-0" />
                        <span>After form submission, you will receive a confirmation email with a PDF form.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mt-1 flex-shrink-0" />
                        <span>Print the PDF form and get proper signature from your priest and official stamp of the church.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mt-1 flex-shrink-0" />
                        <span>Mail the signed and stamped form to: <strong>cni.bdyfc@gmail.com</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mt-1 flex-shrink-0" />
                        <span>Your registration will only be complete after we receive the signed form.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mt-1 flex-shrink-0" />
                        <span>Write participant names exactly as you want them on certificates.</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Group Leader Details Section */}
              <Card className="mb-6 sm:mb-8 border border-red-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="p-2 bg-red-600 rounded-lg">
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-red-900">Group Leader Details</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                    <div className="space-y-2">
                      <Label htmlFor="groupLeader" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        Group Leader Name *
                      </Label>
                      <Input
                        id="groupLeader"
                        value={formData.groupLeaderName}
                        onChange={(e) => handleInputChange('groupLeaderName', e.target.value)}
                        placeholder="Enter group leader name"
                        disabled={isSubmitting}
                        className="border-2 focus:border-red-500 transition-colors text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="church" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Church className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        Church *
                      </label>

                      <Combobox
                        value={formData.church}
                        onChange={(value) => handleInputChange("church", value ?? "")}
                        disabled={isSubmitting}
                      >
                        <div className="relative">
                          <Combobox.Input
                            className="w-full border-2 p-2 rounded focus:border-red-500 text-sm sm:text-base"
                            placeholder="Select Church"
                            onChange={(event) => setQuery(event.target.value)}
                            displayValue={(church) => (church as string)}
                          />
                          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            {filteredChurches.length === 0 ? (
                              <div className="cursor-default select-none p-2 text-gray-500 text-sm">
                                No churches found.
                              </div>
                            ) : (
                              filteredChurches.map((church) => (
                                <Combobox.Option
                                  key={church}
                                  value={church}
                                  className={({ active }) =>
                                    `cursor-pointer select-none p-2 text-sm ${active ? "bg-red-500 text-white" : "text-gray-900"
                                    }`
                                  }
                                >
                                  {church}
                                </Combobox.Option>
                              ))
                            )}
                          </Combobox.Options>
                        </div>
                      </Combobox>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        Location *
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Enter location"
                        disabled={isSubmitting}
                        className="border-2 focus:border-red-500 transition-colors text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        Language of Quiz *
                      </Label>
                      <Select value={formData.langOfQuiz} onValueChange={(value) => handleInputChange('langOfQuiz', value)} disabled={isSubmitting}>
                        <SelectTrigger className="border-2 focus:border-red-500 text-sm sm:text-base">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Marathi">Marathi</SelectItem>
                          <SelectItem value="Tamil">Tamil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zone" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        Your Zone *
                      </Label>
                      <Select value={formData.zone} onValueChange={(value) => handleInputChange('zone', value)} disabled={isSubmitting}>
                        <SelectTrigger className="border-2 focus:border-red-500 text-sm sm:text-base">
                          <SelectValue placeholder="Select zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Centraline">Centraline Zone</SelectItem>
                          <SelectItem value="North-Centraline">North-Centraline Zone</SelectItem>
                          <SelectItem value="South">South Zone</SelectItem>
                          <SelectItem value="East">East Zone</SelectItem>
                          <SelectItem value="West">West Zone</SelectItem>
                          <SelectItem value="Central">Central Zone</SelectItem>
                          <SelectItem value="North">North Zone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        Contact Number *
                      </Label>
                      <Input
                        id="contact"
                        type="tel"
                        value={formData.contactNo}
                        onChange={(e) => handleInputChange('contactNo', e.target.value)}
                        placeholder="Enter contact number"
                        disabled={isSubmitting}
                        className="border-2 focus:border-red-500 transition-colors text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alternate" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        Alternate Number
                      </Label>
                      <Input
                        id="alternate"
                        type="tel"
                        value={formData.alternateNo}
                        onChange={(e) => handleInputChange('alternateNo', e.target.value)}
                        placeholder="Enter alternate number"
                        disabled={isSubmitting}
                        className="border-2 focus:border-red-500 transition-colors text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.mailId}
                        onChange={(e) => handleInputChange('mailId', e.target.value)}
                        placeholder="Enter email address"
                        disabled={isSubmitting}
                        className="border-2 focus:border-red-500 transition-colors text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants Section */}
              <Card className="mb-6 sm:mb-8 border border-red-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-600 rounded-lg">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl text-red-900">Participants Details</CardTitle>
                        <CardDescription className="text-red-700 text-sm">
                          Write names as required on certificates (Minimum 2 participants required)
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-red-300 text-red-700 text-xs sm:text-sm">
                      {filledParticipantCount}/8 Participants
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-800 mb-2">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">Important Notes:</span>
                    </div>
                    <ul className="text-xs sm:text-sm text-red-700 space-y-1">
                      <li>• Participant 1 is automatically filled with Group Leader's details</li>
                      <li>• Minimum 2 participants required for team registration</li>
                      <li>• Maximum 8 participants allowed per team</li>
                      <li>• Enter names exactly as you want them on certificates</li>
                    </ul>
                  </div>

                  {/* Mobile view - stacked layout */}
                  <div className="block sm:hidden space-y-4">
                    {formData.participants.map((participant, index) => (
                      <div key={index} className="p-3 border border-red-200 rounded-lg bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <Badge
                            variant="secondary"
                            className={`flex items-center justify-center px-2 py-1 ${index === 0
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-700'
                              }`}
                          >
                            {index + 1}
                            {index === 0 && <Crown className="w-3 h-3 ml-1" />}
                          </Badge>
                          {index === 0 && (
                            <Badge className="bg-red-600 text-white text-xs px-2 py-1">Leader</Badge>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-semibold text-gray-600">Name *</Label>
                            <Input
                              value={participant.name}
                              onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                              placeholder={index === 0 ? "Auto-filled from Group Leader" : "Enter name"}
                              disabled={index === 0 || isSubmitting}
                              className={`border-2 transition-colors text-sm ${index === 0
                                ? 'bg-red-50 border-red-300 focus:border-red-400'
                                : 'focus:border-red-500'
                                }`}
                            />
                          </div>

                          <div>
                            <Label className="text-xs font-semibold text-gray-600">Gender *</Label>
                            <Select
                              value={participant.gender}
                              onValueChange={(value) => handleParticipantChange(index, 'gender', value)}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger className="border-2 focus:border-red-500 text-sm">
                                <SelectValue placeholder="Gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs font-semibold text-gray-600">Date of Birth *</Label>
                            <Input
                              type="date"
                              value={participant.dob}
                              onChange={(e) => handleParticipantChange(index, 'dob', e.target.value)}
                              disabled={isSubmitting}
                              className="border-2 focus:border-red-500 transition-colors text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-xs font-semibold text-gray-600">Mobile Number</Label>
                            <Input
                              type="tel"
                              value={participant.mobileNo}
                              onChange={(e) => handleParticipantChange(index, 'mobileNo', e.target.value)}
                              placeholder={index === 0 ? "Auto-filled from Contact" : "Mobile number"}
                              disabled={index === 0 || isSubmitting}
                              className={`border-2 transition-colors text-sm ${index === 0
                                ? 'bg-red-50 border-red-300 focus:border-red-400'
                                : 'focus:border-red-500'
                                }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop/Tablet view - table layout */}
                  <div className="hidden sm:block overflow-x-auto">
                    <div className="min-w-full">
                      <div className="grid grid-cols-5 gap-2 lg:gap-4 mb-4 p-3 sm:p-4 bg-gradient-to-r from-red-100 to-rose-100 rounded-lg text-sm lg:text-base">
                        <div className="font-semibold text-red-900">No.</div>
                        <div className="font-semibold text-red-900">Name *</div>
                        <div className="font-semibold text-red-900">Gender *</div>
                        <div className="font-semibold text-red-900">Date of Birth *</div>
                        <div className="font-semibold text-red-900">Mobile Number</div>
                      </div>

                      {formData.participants.map((participant, index) => (
                        <div key={index} className="grid grid-cols-5 gap-2 lg:gap-4 mb-4 p-3 sm:p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                          <div className="flex items-center justify-center">
                            <Badge
                              variant="secondary"
                              className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs ${index === 0
                                ? 'bg-red-600 text-white'
                                : 'bg-red-100 text-red-700'
                                }`}
                            >
                              {index + 1}
                              {index === 0 && <Crown className="w-2 h-2 sm:w-3 sm:h-3 ml-1" />}
                            </Badge>
                          </div>

                          <div className="relative">
                            <Input
                              value={participant.name}
                              onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                              placeholder={index === 0 ? "Auto-filled from Group Leader" : "Enter name"}
                              disabled={index === 0 || isSubmitting}
                              className={`border-2 transition-colors text-xs sm:text-sm ${index === 0
                                ? 'bg-red-50 border-red-300 focus:border-red-400'
                                : 'focus:border-red-500'
                                }`}
                            />
                            {index === 0 && (
                              <div className="absolute -top-2 -right-2">
                                <Badge className="bg-red-600 text-white text-xs px-1">Leader</Badge>
                              </div>
                            )}
                          </div>

                          <Select
                            value={participant.gender}
                            onValueChange={(value) => handleParticipantChange(index, 'gender', value)}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="border-2 focus:border-red-500 text-xs sm:text-sm">
                              <SelectValue placeholder="Gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            type="date"
                            value={participant.dob}
                            onChange={(e) => handleParticipantChange(index, 'dob', e.target.value)}
                            disabled={isSubmitting}
                            className="border-2 focus:border-red-500 transition-colors text-xs sm:text-sm"
                          />

                          <div className="relative">
                            <Input
                              type="tel"
                              value={participant.mobileNo}
                              onChange={(e) => handleParticipantChange(index, 'mobileNo', e.target.value)}
                              placeholder={index === 0 ? "Auto-filled from Contact" : "Mobile number"}
                              disabled={index === 0 || isSubmitting}
                              className={`border-2 transition-colors text-xs sm:text-sm ${index === 0
                                ? 'bg-red-50 border-red-300 focus:border-red-400'
                                : 'focus:border-red-500'
                                }`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {filledParticipantCount < 2 && (
                    <div className="mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="font-semibold text-sm sm:text-base">Minimum team size not met</span>
                      </div>
                      <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                        You need at least 2 participants to form a team. Please add at least one more participant.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Declaration Section */}
              <Card className="mb-6 sm:mb-8 border border-red-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="p-2 bg-red-600 rounded-lg">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-red-900">Declaration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 sm:p-6 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                        Declaration of Group Leader:
                      </h4>
                      <p className="text-red-800 leading-relaxed mb-4 text-sm sm:text-base">
                        I, <span className="font-semibold text-red-900">
                          {formData.groupLeaderName || '[Please Enter the Group Leader Name in the beginning of the form]'}
                        </span>, hereby declare that the above details are true as of my knowledge and belief.
                        I hereby agree to follow the rules and regulations of BDYFC Bible Quiz 2025. I understand that after form submission,
                        I must print the PDF form, get proper signature from priest and church stamp, and mail it to cni.bdyfc@gmail.com
                        for the registration to be complete.
                      </p>

                      <div className="flex items-start space-x-2 pt-4 border-t border-red-200">
                        <Checkbox
                          id="declaration"
                          checked={declarationAccepted}
                          onCheckedChange={checked => setDeclarationAccepted(checked === true)}
                          disabled={isSubmitting}
                          className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 mt-1"
                        />
                        <Label
                          htmlFor="declaration"
                          className="text-xs sm:text-sm font-medium text-red-800 leading-relaxed cursor-pointer"
                        >
                          I confirm and accept the above declaration. I understand that providing false information
                          will result in disqualification from the Bible Quiz.
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Verification Section */}
              <Card className="mb-6 sm:mb-8 border border-red-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="p-2 bg-red-600 rounded-lg">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-red-900">Email Verification</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verificationEmail" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        Verification Email Address *
                      </Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          id="verificationEmail"
                          type="email"
                          value={verificationEmail}
                          onChange={(e) => setVerificationEmail(e.target.value)}
                          placeholder="Enter email for verification"
                          disabled={isSubmitting || isOtpVerified}
                          className="border-2 focus:border-red-500 transition-colors flex-1 text-sm sm:text-base"
                        />
                        <Button
                          onClick={sendOtp}
                          disabled={otpLoading || isOtpVerified || isSubmitting}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 text-sm sm:text-base"
                        >
                          {otpLoading ? (
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                          ) : isOtpVerified ? (
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <>
                              <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Send OTP</span>
                              <span className="sm:hidden">Send</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {isOtpSent && !isOtpVerified && (
                      <div className="space-y-2">
                        <Label htmlFor="otp" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                          Enter OTP *
                        </Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex-1">
                            <Input
                              id="otp"
                              value={otp}
                              onChange={(e) => {
                                setOtp(e.target.value);
                                setOtpError(''); // Clear error when user starts typing
                                if (message.type === 'error') {
                                  setMessage({ type: '', text: '' });
                                }
                              }}
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                              disabled={isSubmitting}
                              className={`border-2 transition-colors text-sm sm:text-base ${otpError
                                ? 'border-red-400 focus:border-red-500 bg-red-50'
                                : 'focus:border-red-500'
                                }`}
                            />
                            {otpError && (
                              <p className="text-xs sm:text-sm text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {otpError}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={verifyOtp}
                            disabled={isSubmitting || !otp.trim() || otpAttempts >= 3}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 text-sm sm:text-base"
                          >
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Verify
                          </Button>
                        </div>
                        <div className="text-xs sm:text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="font-medium">OTP sent to {verificationEmail}</span>
                          </div>
                          <p>Check your inbox and spam folder. OTP expires in 10 minutes.</p>
                          {otpAttempts > 0 && otpAttempts < 3 && (
                            <p className="text-red-700 font-medium mt-1">
                              ⚠️ {3 - otpAttempts} attempt{3 - otpAttempts > 1 ? 's' : ''} remaining
                            </p>
                          )}
                          {otpAttempts >= 3 && (
                            <div className="mt-2 p-2 bg-red-100 rounded border border-red-300">
                              <p className="text-red-800 font-medium">
                                🚫 Maximum attempts exceeded. Please request a new OTP.
                              </p>
                            </div>
                          )}
                        </div>
                        {otpAttempts >= 3 && (
                          <Button
                            onClick={() => {
                              setIsOtpSent(false);
                              setOtp('');
                              setOtpError('');
                              setOtpAttempts(0);
                              setGeneratedOtp('');
                              setMessage({ type: '', text: '' });
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base"
                          >
                            <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Request New OTP
                          </Button>
                        )}
                      </div>
                    )}

                    {isOtpVerified && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-semibold text-sm sm:text-base">Email verified successfully!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bank Details Section */}
              <Card className="mb-6 sm:mb-8 border border-green-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-green-900">Payment Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
                      <h4 className="font-semibold text-green-900 text-base sm:text-lg">Bank Account Details for Payment</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-green-800 text-sm sm:text-base">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="font-medium">Account Name:</span>
                          <span className="font-semibold">DIOCESAN YOUTH COUNCIL</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="font-medium">Account Number:</span>
                          <span className="font-mono font-semibold">415158092</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="font-medium">IFSC Code:</span>
                          <span className="font-mono font-semibold">IDIB000B027</span>
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="font-medium">Bank Name & Address:</span>
                          <span className="font-semibold">Indian Bank, Mumbai Fort (12)</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="font-medium">Registration Fee:</span>
                          <span className="font-semibold text-green-700 text-lg">₹1,000</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white rounded-lg border border-green-300">
                      <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        Payment Instructions:
                      </h5>
                      <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-green-800">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Make the payment using the above bank details</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Take a screenshot or download the payment receipt</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Attach the payment receipt along with the signed and stamped form when mailing to <strong>cni.bdyfc@gmail.com</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Registration will be confirmed only after receiving both the signed form and payment proof</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="text-center">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isOtpVerified || !declarationAccepted}
                  size="lg"
                  className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      <span className="text-sm sm:text-base">Submitting Registration...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="hidden sm:inline">Submit Registration & Download Form</span>
                      <span className="sm:hidden">Submit & Download</span>
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </>
                  )}
                </Button>
                {(!isOtpVerified || !declarationAccepted) && (
                  <p className="text-xs sm:text-sm text-red-600 mt-2 px-2">
                    {!isOtpVerified && !declarationAccepted
                      ? "Please verify your email and accept the declaration before submitting"
                      : !isOtpVerified
                        ? "Please verify your email address before submitting"
                        : "Please accept the declaration before submitting"
                    }
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BibleQuizRegistrationForm;