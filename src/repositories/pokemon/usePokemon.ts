import { service } from "@/services/client.service";
import { useApiQuery } from "@/services/hook";
import { KeyService } from "@/services/key.service";

export const LIMIT_PER_PAGE = 20;

export type TPokemonListResponse = {
  count: number;
  results: {
    name: string;
    url: string;
    id?: number;
  }[];
};

export const usePokemonList = ({
  currentPage,
  disabled,
}: {
  currentPage: number;
  disabled: boolean;
}) => {
  const { data, ...rest } = useApiQuery<TPokemonListResponse>({
    refetchOnWindowFocus: false,
    queryKey: [KeyService.GET_POKEMON_LIST, currentPage || 0, disabled],
    queryFn: async () => {
      if (disabled) return { count: 0, results: [] };
      const pathName = currentPage
        ? `pokemon?offset=${currentPage * LIMIT_PER_PAGE}`
        : "pokemon";
      const response = await service.get<TPokemonListResponse>(pathName);
      const pokemonList = response.results.map((pokemon) => {
        // get the ID from the URL
        const idMatch = pokemon.url.match(/\/pokemon\/(\d+)\//);
        const id = idMatch ? parseInt(idMatch[1], 10) : undefined;
        return {
          ...pokemon,
          id,
        };
      });
      return {
        ...response,
        results: pokemonList,
      };
    },
  });

  return { data, ...rest };
};

export type TPokemonType = { name: string; url: string };
export type TPokemonTypeValue = { name: string; value: number };
export type TPokemonTypesResponse = {
  results: TPokemonType[];
};

export const usePokemonTypes = () => {
  const { data, ...rest } = useApiQuery<TPokemonTypeValue[]>({
    refetchOnWindowFocus: false,
    retry: false,
    queryKey: [KeyService.GET_POKEMON_TYPES],
    queryFn: async () => {
      const response = await service.get<TPokemonTypesResponse>(`type`);
      const typeList = response.results.map((type) => {
        // get the ID from the URL
        const idMatch = type.url.match(/\/type\/(\d+)\//);
        const id = idMatch ? parseInt(idMatch[1], 10) : null;
        return {
          name: type.name,
          value: id,
        };
      });
      return typeList as TPokemonTypeValue[];
    },
  });

  return { data, ...rest };
};

type TPokemonByType = {
  id: number;
  pokemon: {
    pokemon: TPokemonType;
  }[];
};

type TPokemonByTypeResponse = {
  type: number;
  pokemon: {
    name: string;
    id: number;
  }[];
}[];

export const usePokemonByTypeQuery = ({ types }: { types: number[] }) => {
  const { data, ...rest } = useApiQuery<TPokemonByTypeResponse>({
    refetchOnWindowFocus: false,
    queryKey: [KeyService.GET_POKEMON_BY_TYPE, types.length],
    queryFn: async () => {
      if (!types.length) return [];
      const pokemonByTypesReq = types.map((type) =>
        service.get<TPokemonByType>(`type/${type}`)
      );
      const response = await Promise.all(pokemonByTypesReq);
      const pokemonByTypes = response.map((item) => ({
        type: item.id,
        pokemon: item.pokemon.map((pokemon) => ({
          name: pokemon.pokemon.name,
          id: parseInt(pokemon.pokemon.url.match(/\/pokemon\/(\d+)\//)![1], 10),
        })),
      })) as TPokemonByTypeResponse;
      return pokemonByTypes;
    },
  });

  return { data, ...rest };
};

let pokemonCount = 0;

export const usePokemonByTypes = ({
  types,
  selectedTypes,
  currentPage,
}: {
  types: number[];
  selectedTypes: number[];
  currentPage: number;
}) => {
  const { data, isFetching: isPokemonByTypesFetching } = usePokemonByTypeQuery({
    types,
  });
  // Fetch Pokémon list if no types are selected
  const { data: pokemonList, isFetching: isPokemonListFetching } =
    usePokemonList({ currentPage, disabled: selectedTypes.length > 0 });
  const result = getPokemonWithAllTypes(selectedTypes, data);
  if (!pokemonCount) pokemonCount = pokemonList?.count || 0;

  return selectedTypes?.length
    ? {
        count: result.length,
        results: result.slice(
          LIMIT_PER_PAGE * currentPage,
          LIMIT_PER_PAGE * (currentPage + 1)
        ),
        isFetching: isPokemonByTypesFetching,
      }
    : {
        count: pokemonCount,
        results: pokemonList?.results || [],
        isFetching: isPokemonListFetching,
      };
};

const getPokemonWithAllTypes = (
  typeIds: number[],
  data: TPokemonByTypeResponse | undefined
) => {
  // Create a map to store Pokémon IDs and their corresponding types
  const pokemonTypeMap: { [key: number]: Set<number> } = {};

  // Populate the map with Pokémon IDs and their types
  data?.forEach(({ type, pokemon }) => {
    pokemon.forEach(({ id }) => {
      if (!pokemonTypeMap[id]) {
        pokemonTypeMap[id] = new Set();
      }
      pokemonTypeMap[id].add(type);
    });
  });

  // Filter Pokémon that have all the types specified in typeIds
  const result = Object.entries(pokemonTypeMap)
    .filter(([, types]) => typeIds.every((typeId) => types.has(typeId)))
    .map(([id]) => {
      const pokemon = data
        ?.flatMap(({ pokemon }) => pokemon)
        .find((p) => p.id === parseInt(id, 10));
      return pokemon!;
    });
  return result;
};
