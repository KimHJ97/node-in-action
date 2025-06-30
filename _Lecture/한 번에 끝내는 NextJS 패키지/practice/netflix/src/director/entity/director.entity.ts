import { BaseEntity } from 'src/common/entity/base.entity';
import { Movie } from 'src/movie/entity/movie.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

// ManyToOne Director -> 감독은 여러 개의 영화를 만들 수 있음
@Entity()
export class Director extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  dob: Date;

  @Column()
  nationality: string;

  @OneToMany(() => Movie, (movie) => movie.director)
  movies: Movie[];
}
