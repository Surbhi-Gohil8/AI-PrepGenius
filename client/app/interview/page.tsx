'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useResume } from '@/hooks/useResume';
import { api } from '@/lib/api';
import ResumeUpload from '@/components/resume/ResumeUpload';
import ResumePreviewCard from '@/components/resume/ResumePreviewCard';
import ResumeATSChecker from '@/components/resume/ResumeATSChecker';
import ResumeAnalysisLoader from '@/components/resume/ResumeAnalysisLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CheckCircle2,
  Circle,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  Rocket,
  Info,
  Code2,
  Server,
  Layers,
  Smartphone,
  CloudLightning,
  Network,
  Loader2,
  GraduationCap
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function InterviewSetupPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { resumeData, loading: resumeLoading, deleteResumeData, refetchResume } = useResume();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationFinished, setGenerationFinished] = useState(false);
  const [tempSessionId, setTempSessionId] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // List of domains with their associated keywords for matching
  const domains = [
    {
      id: 'Frontend Engineering',
      title: 'Frontend Engineering',
      description: 'JavaScript, React, Next.js, CSS, HTML5, Web performance, UI rendering',
      icon: Code2,
      keywords: ['react', 'next.js', 'frontend', 'html', 'css', 'javascript', 'typescript', 'tailwind']
    },
    {
      id: 'Backend Engineering',
      title: 'Backend Engineering',
      description: 'Node.js, Express, databases (SQL/NoSQL), REST APIs, authentication',
      icon: Server,
      keywords: ['node.js', 'express', 'backend', 'mongodb', 'postgresql', 'sql', 'nosql', 'api', 'jwt']
    },
    {
      id: 'Full Stack Engineering',
      title: 'Full Stack Engineering',
      description: 'End-to-end applications, database schema designs, web architectures',
      icon: Layers,
      keywords: ['full stack', 'fullstack', 'react', 'node.js', 'express', 'mongodb', 'sql', 'docker']
    },
    {
      id: 'Mobile Development',
      title: 'Mobile Development',
      description: 'React Native, Flutter, iOS (Swift), Android (Kotlin), mobile lifecycle',
      icon: Smartphone,
      keywords: ['ios', 'android', 'swift', 'kotlin', 'react native', 'flutter', 'mobile']
    },
    {
      id: 'DevOps & Cloud',
      title: 'DevOps & Cloud Engineering',
      description: 'Docker, Kubernetes, CI/CD pipelines, AWS, infrastructure as code',
      icon: CloudLightning,
      keywords: ['docker', 'kubernetes', 'aws', 'devops', 'ci/cd', 'github actions', 'cloud', 'terraform']
    },
    {
      id: 'System Design',
      title: 'System Design & Scaling',
      description: 'Microservices, WebSockets, caching (Redis), CDNs, scaling networks',
      icon: Network,
      keywords: ['system design', 'websockets', 'redis', 'scaling', 'caching', 'microservices', 'load balancing']
    },
    {
      id: 'Other',
      title: 'Other Field',
      description: 'Mechanical, Biotechnology, Civil, Electrical, MBA, or any other domain',
      icon: GraduationCap,
      keywords: []
    }
  ];

  const resolvedDomain =
    selectedDomain === 'Other' ? customDomain.trim() : selectedDomain;

  const isDomainStepValid =
    selectedDomain !== '' &&
    (selectedDomain !== 'Other' || customDomain.trim().length > 0);

  // Helper to check if domain is detected in candidate resume
  const isDomainDetected = (domainKeywords: string[]) => {
    if (!resumeData) return false;
    
    // Check in rawText, skills, and detectedDomains
    const rawLower = resumeData.rawText.toLowerCase();
    const skillsLower = resumeData.skills.map(s => s.toLowerCase());
    const detectedLower = resumeData.detectedDomains.map(d => d.toLowerCase());

    return domainKeywords.some(keyword => 
      rawLower.includes(keyword) || 
      skillsLower.some(skill => skill.includes(keyword)) ||
      detectedLower.some(domain => domain.includes(keyword))
    );
  };

  // Helper to recommend difficulty based on resume experience
  const getRecommendation = () => {
    if (!resumeData) return { difficulty: 'Medium', reason: 'Recommended based on standard profiles.' };
    
    const level = resumeData.experienceLevel;
    const years = resumeData.yearsOfExperience;

    if (level === 'Senior' || years > 5) {
      return {
        difficulty: 'Hard',
        reason: `Based on your ${years} years of senior-level experience, we recommend Hard to test advanced designs.`
      };
    } else if (level === 'Mid' || years >= 2) {
      return {
        difficulty: 'Medium',
        reason: `Based on your ${years} years of mid-level experience, we recommend Medium to test intermediate architecture.`
      };
    } else {
      return {
        difficulty: 'Easy',
        reason: `Based on your ${years} years of junior-level experience, we recommend starting with Easy to review foundational items.`
      };
    }
  };

  const recommendation = getRecommendation();

  // Progress Bar rendering
  const renderProgressBar = () => {
    const stepsArr = [
      { num: 1, name: 'Resume Upload' },
      { num: 2, name: 'Choose Domain' },
      { num: 3, name: 'Difficulty' }
    ];

    return (
      <div className="flex items-center justify-center max-w-lg mx-auto w-full py-4 mb-8">
        {stepsArr.map((s, idx) => (
          <div key={s.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative">
              {step > s.num ? (
                <CheckCircle2 className="h-6 w-6 text-indigo-500 fill-indigo-500/10 cursor-pointer" onClick={() => setStep(s.num)} />
              ) : step === s.num ? (
                <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white ring-4 ring-indigo-500/20">
                  {s.num}
                </div>
              ) : (
                <Circle className="h-6 w-6 text-text-muted shrink-0" />
              )}
              <span className={`text-[10px] font-semibold uppercase mt-1.5 whitespace-nowrap absolute -bottom-6 ${step === s.num ? 'text-indigo-400 font-bold' : 'text-text-secondary'}`}>
                {s.name}
              </span>
            </div>
            
            {idx < stepsArr.length - 1 && (
              <div className={`h-[2px] flex-1 mx-3 ${step > s.num ? 'bg-indigo-600' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleResumeSuccess = () => {
    refetchResume();
  };

  const handleStartInterview = async () => {
    setIsGenerating(true);
    try {
      // 1. Create Session
      const startRes = await api.post('/interview/start', {
        domain: resolvedDomain,
        difficulty: selectedDifficulty
      });
      const sessionId = startRes.data._id;
      setTempSessionId(sessionId);

      // 2. Trigger question generation
      await api.post('/interview/generate-questions', {
        domain: resolvedDomain,
        difficulty: selectedDifficulty,
        sessionId
      });

      // 3. Mark generation finished -> triggers redirection
      setGenerationFinished(true);
    } catch (err) {
      console.error('Failed to create session / generate questions:', err);
      alert('Failed to generate interview questions. Please try again.');
      setIsGenerating(false);
    }
  };

  if (authLoading || resumeLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <span className="text-sm font-semibold text-text-secondary">Loading setup steps...</span>
        </div>
      </div>
    );
  }

  // Question generator loader
  if (isGenerating) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <ResumeAnalysisLoader
          title="Personalizing Interview Questions"
          onFinished={() => {
            if (generationFinished && tempSessionId) {
              router.push(`/interview/${tempSessionId}`);
            }
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col justify-start"
    >
      <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Setup Your Interview Session
        </h1>
        <p className="text-text-secondary text-sm">
          Complete the steps below to configure your tailored interview questions.
        </p>
      </div>

      {renderProgressBar()}

      <div className="mt-8 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* STEP 1: Resume Upload / Preview */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {!resumeData ? (
                <div className="space-y-4">
                  <Alert className="bg-indigo-500/5 border-indigo-500/10 text-indigo-400 p-4 rounded-xl max-w-xl mx-auto">
                    <Info size={16} className="shrink-0" />
                    <div>
                      <AlertTitle className="font-bold text-xs text-text-primary">Resume Requirement</AlertTitle>
                      <AlertDescription className="text-text-secondary text-xxs mt-0.5">
                        Our mock sessions parse your exact project history and skills. Please upload your profile to proceed.
                      </AlertDescription>
                    </div>
                  </Alert>
                  <ResumeUpload onSuccess={handleResumeSuccess} />
                </div>
              ) : (
                <div className="space-y-6">
                  <ResumePreviewCard
                    resumeData={resumeData}
                    onReupload={deleteResumeData}
                    onConfirm={() => setStep(2)}
                  />
                  <ResumeATSChecker
                    targetRoleDefault={resumeData.detectedDomains[0] || ''}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: Choose Domain */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-text-primary">Choose your Interview Domain</h3>
                <p className="text-xs text-text-secondary">Pick a tech domain or choose Other for fields like mechanical engineering, biotechnology, and more.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {domains.map((dom) => {
                  const DomIcon = dom.icon;
                  const detected = isDomainDetected(dom.keywords);
                  const isSelected = selectedDomain === dom.id;

                  return (
                    <motion.div
                      key={dom.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedDomain(dom.id);
                        if (dom.id !== 'Other') setCustomDomain('');
                      }}
                    >
                      <Card
                        className={`h-full border transition-all duration-300 relative overflow-hidden ${
                          isSelected
                            ? 'bg-card border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                            : 'bg-card border-border hover:border-indigo-500/20'
                        }`}
                      >
                        {detected && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="outline" className="py-0.5 px-2 bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[9px] font-bold rounded-full flex items-center gap-1">
                              <CheckCircle2 size={8} className="fill-current" />
                              Detected
                            </Badge>
                          </div>
                        )}
                        <CardContent className="p-6 flex flex-col h-full gap-4">
                          <div className={`p-3 rounded-xl w-fit ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-muted text-text-secondary'}`}>
                            <DomIcon size={20} />
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="text-base font-bold text-text-primary">{dom.title}</h4>
                            <p className="text-xs text-text-secondary leading-relaxed">{dom.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {selectedDomain === 'Other' && (
                <div className="max-w-md mx-auto space-y-2">
                  <label htmlFor="custom-domain" className="text-sm font-semibold text-text-primary">
                    Your field or domain
                  </label>
                  <Input
                    id="custom-domain"
                    placeholder="e.g. Mechanical Engineering, Biotechnology, Civil Engineering"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="bg-card border-border"
                  />
                  <p className="text-xs text-text-secondary">
                    Questions will be tailored to this field and your resume.
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-8 border-t border-border/50 max-w-xl mx-auto">
                <Button variant="ghost" onClick={() => setStep(1)} className="border border-border gap-2 cursor-pointer">
                  <ArrowLeft size={16} /> Back
                </Button>
                <Button
                  disabled={!isDomainStepValid}
                  onClick={() => setStep(3)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2 cursor-pointer"
                >
                  Continue <ArrowRight size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Difficulty */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 max-w-2xl mx-auto"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-text-primary">Select Difficulty Level</h3>
                <p className="text-xs text-text-secondary">Set the benchmark depth of your interview simulation questions.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {['Easy', 'Medium', 'Hard'].map((diff) => {
                  const isSelected = selectedDifficulty === diff;
                  const isRecommended = recommendation.difficulty === diff;

                  return (
                    <motion.div
                      key={diff}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="cursor-pointer"
                      onClick={() => setSelectedDifficulty(diff)}
                    >
                      <Card
                        className={`border text-center transition-all duration-300 relative ${
                          isSelected
                            ? 'bg-card border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                            : 'bg-card border-border hover:border-indigo-500/20'
                        }`}
                      >
                        {isRecommended && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white border-none py-0.5 px-2.5 text-[9px] font-bold rounded-full shadow">
                              Recommended
                            </Badge>
                          </div>
                        )}
                        <CardContent className="p-8 flex flex-col items-center gap-2">
                          <h4 className="text-xl font-extrabold text-text-primary">{diff}</h4>
                          <p className="text-xxs text-text-secondary uppercase font-semibold">
                            {diff === 'Easy' && 'Foundational'}
                            {diff === 'Medium' && 'Core Concepts'}
                            {diff === 'Hard' && 'Architecture & Scale'}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Recommendation Alert Box */}
              <Alert className="bg-indigo-500/5 border-indigo-500/15 text-indigo-400 p-4 rounded-xl mt-6">
                <Lightbulb size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <AlertTitle className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                    Profile Suggestion
                  </AlertTitle>
                  <AlertDescription className="text-text-secondary text-xxs mt-0.5">
                    {recommendation.reason}
                  </AlertDescription>
                </div>
              </Alert>

              <div className="flex justify-between items-center pt-8 border-t border-border/50">
                <Button variant="ghost" onClick={() => setStep(2)} className="border border-border gap-2 cursor-pointer">
                  <ArrowLeft size={16} /> Back
                </Button>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    disabled={!selectedDifficulty}
                    onClick={handleStartInterview}
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-extrabold px-8 shadow-xl cursor-pointer gap-2 h-11"
                  >
                    <Rocket size={16} />
                    Generate My Questions
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
