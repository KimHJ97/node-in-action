import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { MovieDetail } from './movie-detail.entity';
import { BaseEntity } from 'src/common/entity/base.entity';
import { Director } from 'src/director/entity/director.entity';

// ManyToMany Genre -> 영화는 여러 개의 장르를 가질 수 있고, 장르는 여러 개의 영화에 속할 수 있음

@Entity()
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre?: string;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.movie, {
    cascade: false,
  })
  @JoinColumn()
  detail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.id, {
    cascade: true,
    nullable: false,
  })
  director: Director;
}
