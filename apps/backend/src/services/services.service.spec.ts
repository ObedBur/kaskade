import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { PrismaService } from '../prisma/prisma.service';

interface MockService {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number | null;
  currency?: string;
  imageKey: string | null;
  isActive: boolean;
  providers: Array<{ quartier: string }>;
}

const baseService = (id: string, name: string): MockService => ({
  id,
  name,
  category: 'GENERAL',
  description: '',
  price: null,
  currency: 'EUR',
  imageKey: null,
  isActive: true,
  providers: [],
});

type SearchResult = Array<{ id: string }>;

describe('ServicesService – search', () => {
  let service: ServicesService;
  let findManyMock: jest.Mock;

  const moduleRef = async () => {
    findManyMock = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: PrismaService,
          useValue: { service: { findMany: findManyMock } },
        },
      ],
    }).compile();
    return module.get<ServicesService>(ServicesService);
  };

  beforeEach(async () => {
    service = await moduleRef();
    findManyMock.mockReset();
  });

  const ids = async (q: string): Promise<string[]> => {
    const res = (await service.search(q)) as SearchResult;
    return res.map((s) => s.id).sort();
  };

  it('retourne [] si la requête est vide', async () => {
    const res = await service.search('   ');
    expect(res).toEqual([]);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it('rice, Rice, RICE et rîce retournent le même ensemble de services', async () => {
    findManyMock.mockResolvedValue([
      baseService('a', 'Rice Blue'),
      baseService('b', 'Riz complet'),
      baseService('c', 'Rustique'),
    ]);

    const reference = await ids('rice');
    expect(reference).toEqual(['a']);
    expect(reference).toEqual(await ids('Rice'));
    expect(reference).toEqual(await ids('RICE'));
    expect(reference).toEqual(await ids('rîce'));
  });

  it('« Sur » ne retourne aucun service dont le nom ne contient pas « sur »', async () => {
    findManyMock.mockResolvedValue([
      {
        ...baseService('descmatch', 'Rustique Métal Vélo'),
        description: 'Expédition sur toute la France',
      },
      baseService('nameMatch', 'Surligneur Pro'),
    ]);

    expect(await ids('Sur')).toEqual(['nameMatch']);
  });

  it('Orien retourne uniquement les noms contenant « orien » ou variantes normalisées', async () => {
    findManyMock.mockResolvedValue([
      baseService('a', 'Orientale Couture'),
      {
        ...baseService('b', 'Machine à laver'),
        description: 'Service de style oriental',
      },
    ]);

    expect(await ids('Orien')).toEqual(['a']);
  });

  it('rice blue exige la présence des deux mots (logique AND)', async () => {
    findManyMock.mockResolvedValue([
      baseService('both', 'Rice Blue'),
      baseService('riceOnly', 'Rice Pudding'),
      baseService('blueOnly', 'Blue Dye'),
    ]);

    expect(await ids('rice blue')).toEqual(['both']);
  });

  it('une requête inconnue retourne zéro résultat', async () => {
    findManyMock.mockResolvedValue([
      baseService('a', 'Rice Blue'),
      baseService('b', 'Plombier'),
    ]);

    expect(await ids('zzzzqwerty')).toEqual([]);
  });

  it('classe par pertinence : nom exact > nom commençant par > nom contenant', async () => {
    findManyMock.mockResolvedValue([
      { ...baseService('contain', 'Gratuit Plombier'), price: 10 },
      { ...baseService('start', 'Plombier Pro'), price: 50 },
      { ...baseService('exact', 'Plom'), price: 999 },
      baseService('other', 'Électricien'),
    ]);

    const res = (await service.search('plom')) as SearchResult;
    expect(res.map((s) => s.id)).toEqual(['exact', 'start', 'contain']);
  });

  it('trie par prix croissant parmi les résultats de même pertinence', async () => {
    findManyMock.mockResolvedValue([
      { ...baseService('a', 'Charlie Plomb'), price: 200 },
      { ...baseService('b', 'Delta Plomb'), price: 100 },
    ]);

    const res = (await service.search('plomb')) as SearchResult;
    expect(res.map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('place les prix null en fin de tri', async () => {
    findManyMock.mockResolvedValue([
      baseService('a', 'Plomb Classique'),
      { ...baseService('b', 'Plomb Direct'), price: 150 },
    ]);

    const res = (await service.search('plomb')) as SearchResult;
    expect(res.map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('une erreur SQL ne retourne jamais tous les services', async () => {
    findManyMock.mockRejectedValue(new Error('DB down'));

    await expect(service.search('rice')).rejects.toThrow('DB down');
  });

  it('le score de pertinence est calculé uniquement sur le nom (pas description/quartier)', async () => {
    findManyMock.mockResolvedValue([
      baseService('onlyQuartier', 'Garde de nuit'),
      { ...baseService('nameQuartier', 'Surintendant'), price: 10 },
    ]);

    expect(await ids('sur')).toEqual(['nameQuartier']);
  });
});
