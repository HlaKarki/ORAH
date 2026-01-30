import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import type { Session } from "./Session";
import type { Explanation } from "./Explanation";
import type { SavedExplanation } from "./SavedExplanation";
import type { UserSettings } from "./UserSettings";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  firstName!: string;

  @Column({ type: "varchar", length: 255 })
  lastName!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ type: "varchar", length: 64 })
  passwordSalt!: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany("Session", "user")
  sessions!: Session[];

  @OneToMany("Explanation", "user")
  explanations!: Explanation[];

  @OneToMany("SavedExplanation", "user")
  savedExplanations!: SavedExplanation[];

  @OneToOne("UserSettings", "user")
  settings!: UserSettings;

  get initials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
