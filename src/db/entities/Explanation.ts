import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { User } from "./User";

export type AudienceLevel = "5yo" | "highschool" | "college" | "professional" | "expert";

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface OnePageContent {
  summary_1_sentence: string;
  analogy: string;
  key_points: string[];
  key_terms: KeyTerm[];
  why_it_matters: string;
  related_topics: string[];
}

export interface RecordingData {
  audioUrl: string | null;
  segments: { text: string; startTime: number; endTime: number }[];
  recordingDuration: number;
}

@Entity("explanations")
export class Explanation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne("User", "explanations", { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "varchar", length: 500 })
  title!: string;

  @Column({ type: "text" })
  scriptForAudio!: string;

  @Column({ type: "integer", default: 0 })
  audioDuration!: number;

  @Column({ type: "varchar", length: 50 })
  audience!: AudienceLevel;

  @Column({ type: "text" })
  onePageContent!: string;

  @Column({ type: "text", nullable: true })
  recordingData!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  getOnePageContent(): OnePageContent {
    return JSON.parse(this.onePageContent) as OnePageContent;
  }

  setOnePageContent(content: OnePageContent): void {
    this.onePageContent = JSON.stringify(content);
  }

  getRecordingData(): RecordingData | null {
    if (!this.recordingData) return null;
    return JSON.parse(this.recordingData) as RecordingData;
  }

  setRecordingData(data: RecordingData | null): void {
    this.recordingData = data ? JSON.stringify(data) : null;
  }
}
