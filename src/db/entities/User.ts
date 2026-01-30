import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { Session } from "./Session";
import { Explanation } from "./Explanation";
import { SavedExplanation } from "./SavedExplanation";
import { UserSettings } from "./UserSettings";

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

  @OneToMany(() => Session, (session) => session.user)
  sessions!: Session[];

  @OneToMany(() => Explanation, (explanation) => explanation.user)
  explanations!: Explanation[];

  @OneToMany(() => SavedExplanation, (saved) => saved.user)
  savedExplanations!: SavedExplanation[];

  @OneToOne(() => UserSettings, (settings) => settings.user)
  settings!: UserSettings;

  get initials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
