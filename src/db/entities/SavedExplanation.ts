import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./User";
import { Explanation } from "./Explanation";

@Entity("saved_explanations")
@Unique(["userId", "explanationId"])
export class SavedExplanation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, (user) => user.savedExplanations, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "uuid" })
  explanationId!: string;

  @ManyToOne(() => Explanation, { onDelete: "CASCADE" })
  @JoinColumn({ name: "explanationId" })
  explanation!: Explanation;

  @CreateDateColumn()
  savedAt!: Date;
}
