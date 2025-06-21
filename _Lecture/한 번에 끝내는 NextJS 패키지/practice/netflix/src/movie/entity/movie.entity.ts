import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { MovieDetail } from './movie-detail.entity';

// ManyToOne Director -> 감독은 여러 개의 영화를 만들 수 있음

// ManyToMany Genre -> 영화는 여러 개의 장르를 가질 수 있고, 장르는 여러 개의 영화에 속할 수 있음

@Entity()
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre?: string;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.movie)
  @JoinColumn()
  detail: MovieDetail;
}
