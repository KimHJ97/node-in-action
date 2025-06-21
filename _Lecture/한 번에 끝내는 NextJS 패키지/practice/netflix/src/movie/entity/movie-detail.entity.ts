import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from './movie.entity';

// OneToOne MovieDetail -> 영화는 하나의 상세 내용을 가질 수 있음
@Entity()
export class MovieDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  detail: string;

  @OneToOne(() => Movie, (movie) => movie.detail)
  movie: Movie;
}
