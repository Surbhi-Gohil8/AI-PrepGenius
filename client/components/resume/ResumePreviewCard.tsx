'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, FolderOpen, Briefcase, GraduationCap, RefreshCw, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResumeData } from '@/types';

interface ResumePreviewCardProps {
  resumeData: ResumeData;
  onReupload: () => void;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
}

export default function ResumePreviewCard({
  resumeData,
  onReupload,
  onConfirm,
  showConfirmButton = true
}: ResumePreviewCardProps) {
  
  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'Senior':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'Mid':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'Junior':
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    }
  };

  const skillsToDisplay = resumeData.skills.slice(0, 8);
  const extraSkillsCount = resumeData.skills.length - 8;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="premium-card bg-card border-border text-foreground hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
        <CardHeader className="border-b border-border/50 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-text-primary">Detected Candidate Profile</CardTitle>
                <CardDescription className="text-text-secondary">Extracted details from your resume</CardDescription>
              </div>
            </div>
            
            <Badge variant="outline" className={`py-1 px-3 text-sm font-semibold rounded-full border ${getExperienceLevelColor(resumeData.experienceLevel)}`}>
              {resumeData.experienceLevel} Level
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Key Stats: Experience, Domains, Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Briefcase size={16} className="text-indigo-500" />
                <span className="font-semibold text-text-primary">Experience:</span>
                <span>{resumeData.yearsOfExperience} {resumeData.yearsOfExperience === 1 ? 'Year' : 'Years'}</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <GraduationCap size={16} className="text-indigo-500" />
                <span className="font-semibold text-text-primary">Education:</span>
                <span className="truncate">{resumeData.education || 'Not specified'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Detected Domains</h4>
              <div className="flex flex-wrap gap-1 items-center text-sm text-text-secondary">
                {resumeData.detectedDomains.map((domain, idx) => (
                  <React.Fragment key={domain}>
                    {idx > 0 && <span className="text-text-muted">•</span>}
                    <span className="font-medium text-text-primary">{domain}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Skills Matrix</h4>
            <div className="flex flex-wrap gap-2">
              {skillsToDisplay.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/10 rounded-md">
                  {skill}
                </Badge>
              ))}
              {extraSkillsCount > 0 && (
                <Badge variant="outline" className="bg-transparent border border-border text-text-muted rounded-md">
                  +{extraSkillsCount} more
                </Badge>
              )}
            </div>
          </div>

          {/* Projects */}
          {resumeData.projects.length > 0 && (
            <div className="space-y-3 border-t border-border/50 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <FolderOpen size={14} className="text-indigo-500" /> Mentioned Projects
              </h4>
              <ul className="space-y-1 text-sm text-text-secondary">
                {resumeData.projects.slice(0, 3).map((project, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-text-primary">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    {project}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Previous Roles */}
          {resumeData.previousRoles.length > 0 && (
            <div className="space-y-3 border-t border-border/50 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <Briefcase size={14} className="text-indigo-500" /> Previous Roles
              </h4>
              <div className="flex flex-wrap gap-2">
                {resumeData.previousRoles.map((role, idx) => (
                  <Badge key={idx} variant="outline" className="bg-card text-text-secondary border-border rounded-md">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {showConfirmButton && (
          <CardFooter className="flex flex-col sm:flex-row gap-4 border-t border-border/50 pt-6">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full sm:flex-1">
              <Button
                type="button"
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold cursor-pointer gap-2"
                onClick={onConfirm}
              >
                Looks Good? Start Setup
                <ArrowRight size={16} />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-text-secondary hover:text-text-primary cursor-pointer border border-border sm:border-transparent gap-2"
                onClick={onReupload}
              >
                <RefreshCw size={16} />
                Re-upload
              </Button>
            </motion.div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
