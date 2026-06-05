'use client';

import { FileText, BookOpen, FolderGit, Cpu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResumeData } from '@/types';
import { motion } from 'framer-motion';

interface ResumeContextSheetProps {
  resumeData: ResumeData;
}

export default function ResumeContextSheet({ resumeData }: ResumeContextSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 shadow-md cursor-pointer"
          >
            <FileText size={16} />
            <span>View Resume Profile</span>
          </Button>
        </motion.div>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md bg-card border-l border-border text-foreground p-6">
        <SheetHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-2 text-indigo-500">
            <BookOpen size={20} />
            <SheetTitle className="text-xl font-bold text-text-primary">Resume Context</SheetTitle>
          </div>
          <SheetDescription className="text-text-secondary text-sm">
            These questions are customized based on the details you provided in your resume profile.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)] pr-2 mt-4 space-y-6">
          {/* Experience level */}
          <div className="space-y-2 mt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Experience Level</h4>
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 py-1 px-3 rounded-full text-xs font-semibold">
                {resumeData.experienceLevel} ({resumeData.yearsOfExperience} {resumeData.yearsOfExperience === 1 ? 'year' : 'years'} exp)
              </Badge>
            </div>
          </div>

          {/* Skills Badges */}
          <div className="space-y-2 pt-4 border-t border-border/30">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Cpu size={14} className="text-indigo-400" /> Declared Skills
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {resumeData.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-card text-text-secondary border border-border text-xs rounded-md">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Projects List */}
          {resumeData.projects.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/30">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <FolderGit size={14} className="text-indigo-400" /> Resume Projects
              </h4>
              <ul className="space-y-2">
                {resumeData.projects.map((proj, idx) => (
                  <li key={idx} className="bg-background border border-border/50 p-3 rounded-lg text-sm">
                    <p className="font-semibold text-text-primary flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      {proj}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Previous Roles */}
          {resumeData.previousRoles.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/30">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Previous Roles</h4>
              <div className="flex flex-col gap-1.5">
                {resumeData.previousRoles.map((role, idx) => (
                  <p key={idx} className="text-sm text-text-secondary pl-3 border-l-2 border-indigo-500/30">
                    {role}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resumeData.education && (
            <div className="space-y-2 pt-4 border-t border-border/30 pb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Education</h4>
              <p className="text-sm text-text-secondary">
                {resumeData.education}
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
