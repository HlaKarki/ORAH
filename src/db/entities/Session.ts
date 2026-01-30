import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { User } from "./User";

@Entity("sessions")
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 64, unique: true })
  token!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne("User", "sessions", { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "datetime" })
  expiresAt!: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  userAgent!: string | null;

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
