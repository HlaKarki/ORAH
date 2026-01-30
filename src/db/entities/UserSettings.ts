import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import type { User } from "./User";

export type ThemeType = "dark" | "light" | "system";

@Entity("user_settings")
export class UserSettings {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", unique: true })
  userId!: string;

  @OneToOne("User", "settings", { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "varchar", length: 255, default: "default" })
  voice!: string;

  @Column({ type: "real", default: 1.0 })
  speed!: number;

  @Column({ type: "varchar", length: 20, default: "dark" })
  theme!: ThemeType;

  @Column({ type: "boolean", default: true })
  autoPlay!: boolean;

  @Column({ type: "boolean", default: false })
  showTranscript!: boolean;
}
