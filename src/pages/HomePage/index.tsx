"use client";
import styles from "./styles.module.css";
import {
  LIMIT_PER_PAGE,
  usePokemonByTypes,
  usePokemonTypes,
} from "../../repositories/pokemon/usePokemon";
import { Button, Pagination } from "antd";
import { useState } from "react";
import { Skeleton } from "antd";
import Image from "next/image";

// this will help to get the pokemon image
// from demo website we get this by pokemon detail api, but it make us call too many apis so this will help to improve performance
const pokemonBaseImg = (id: string) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export default function HomePage() {
  const { data: pokemonTypes } = usePokemonTypes();
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const { results, count, isFetching } = usePokemonByTypes({
    types: pokemonTypes?.map((item) => item.value) || [],
    selectedTypes: selectedTypes,
    currentPage,
  });

  const onSelectType = (type: number) => {
    if (!selectedTypes.includes(type)) {
      setSelectedTypes((s) => [...s, type]);
    } else {
      setSelectedTypes((s) => s.filter((item) => item !== type));
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <h4>Types:</h4>
      <div className={styles.buttonContainer}>
        {pokemonTypes?.map((type) => (
          <Button
            onClick={() => {
              onSelectType(type.value);
              setCurrentPage(0);
            }}
            type={selectedTypes.includes(type.value) ? "primary" : "default"}
            key={type.value}
          >
            {type.name}
          </Button>
        ))}
      </div>
      <p style={{ marginTop: "20px" }}>{count} Results Found</p>
      {isFetching ? (
        <PokemonListLoading />
      ) : results.length ? (
        <PokemonListContent pokemonList={results} />
      ) : (
        <h4 style={{ textAlign: "center", marginTop: "50px" }}>
          No Result Found
        </h4>
      )}
      {count > 0 && (
        <Pagination
          align="center"
          onChange={(page) => setCurrentPage(page - 1)}
          pageSize={LIMIT_PER_PAGE}
          current={currentPage + 1}
          total={count}
          showSizeChanger={false}
        />
      )}
    </div>
  );
}

const PokemonListLoading = () => {
  return (
    <div className={styles.pokemonListContainer}>
      {Array.from({ length: 5 }, (_, i) => i + 1).map((key) => (
        <div className={styles.skeletonItem} key={key}>
          <Skeleton.Node active />
          <Skeleton.Input className={styles.skeletonInput} active />
        </div>
      ))}
    </div>
  );
};

const PokemonListContent = ({
  pokemonList,
}: {
  pokemonList: {
    name: string;
    id?: number;
  }[];
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={styles.pokemonListContainer}>
      {pokemonList?.map((pokemon) => (
        <div key={pokemon.name} className={styles.pokemonContainer}>
          <div className={styles.pokemonImg}>
            {!loaded && <Skeleton.Node />}
            <Image
              src={pokemonBaseImg(pokemon.id?.toString() || "")}
              alt={pokemon.name}
              fill
              onLoadingComplete={() => setLoaded(true)}
            />
          </div>
          <p>{pokemon.name}</p>
        </div>
      ))}
    </div>
  );
};
