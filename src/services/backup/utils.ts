import { SELF_HOST_BACKUP } from '@hooks/persisted/useSelfHost';
import { TRACKER } from '@hooks/persisted/useTracker';
import { LAST_UPDATE_TIME } from '@hooks/persisted/useUpdates';
import { MMKVStorage } from '@utils/mmkv/mmkv';
import { version } from '../../../package.json';
import {
  _restoreNovelAndChapters,
  getAllNovels,
} from '@database/queries/NovelQueries';
import { getNovelChapters } from '@database/queries/ChapterQueries';
import {
  _restoreCategory,
  getAllNovelCategories,
  getCategoriesFromDb,
} from '@database/queries/CategoryQueries';
import { BackupCategory } from '@database/types';
import { BackupEntryName } from './types';
import { ROOT_STORAGE } from '@utils/Storages';
import ServiceManager from '@services/ServiceManager';
import NativeFile from '@specs/NativeFile';

const APP_STORAGE_URI = 'file://' + ROOT_STORAGE;

export const CACHE_DIR_PATH =
  NativeFile.getConstants().ExternalCachesDirectoryPath + '/BackupData';

const backupMMKVData = () => {
  const excludeKeys = [
    ServiceManager.manager.STORE_KEY,
    TRACKER,
    SELF_HOST_BACKUP,
    LAST_UPDATE_TIME,
  ];
  const keys = MMKVStorage.getAllKeys().filter(
    key => !excludeKeys.includes(key),
  );
  const data = {} as any;
  for (const key of keys) {
    let value: number | string | boolean | undefined =
      MMKVStorage.getString(key);
    if (!value) {
      value = MMKVStorage.getBoolean(key);
    }
    if (key && value) {
      data[key] = value;
    }
  }
  return data;
};

const restoreMMKVData = (data: any) => {
  for (const key in data) {
    MMKVStorage.set(key, data[key]);
  }
};

export const prepareBackupData = async (cacheDirPath: string) => {
  const novelDirPath = cacheDirPath + '/' + BackupEntryName.NOVEL_AND_CHAPTERS;
  if (NativeFile.exists(novelDirPath)) {
    NativeFile.unlink(novelDirPath);
  }

  NativeFile.mkdir(novelDirPath); // this also creates cacheDirPath

  // version
  NativeFile.writeFile(
    cacheDirPath + '/' + BackupEntryName.VERSION,
    JSON.stringify({ version: version }),
  );

  // novels
  await getAllNovels().then(async novels => {
    for (const novel of novels) {
      const chapters = await getNovelChapters(novel.id);
      NativeFile.writeFile(
        novelDirPath + '/' + novel.id + '.json',
        JSON.stringify({
          chapters: chapters,
          ...novel,
          cover: novel.cover?.replace(APP_STORAGE_URI, ''),
        }),
      );
    }
  });

  // categories
  const categories = getCategoriesFromDb();
  const novelCategories = getAllNovelCategories();
  NativeFile.writeFile(
    cacheDirPath + '/' + BackupEntryName.CATEGORY,
    JSON.stringify(
      categories.map(category => {
        return {
          ...category,
          novelIds: novelCategories
            .filter(nc => nc.categoryId === category.id)
            .map(nc => nc.novelId),
        };
      }),
    ),
  );

  // settings
  NativeFile.writeFile(
    cacheDirPath + '/' + BackupEntryName.SETTING,
    JSON.stringify(backupMMKVData()),
  );
};

export const restoreData = async (cacheDirPath: string) => {
  const novelDirPath = cacheDirPath + '/' + BackupEntryName.NOVEL_AND_CHAPTERS;

  // version
  // nothing to do

  // novels
  const items = NativeFile.readDir(novelDirPath);
  for (const item of items) {
    if (!item.isDirectory) {
      const backupNovel = JSON.parse(NativeFile.readFile(item.path));
      if (!backupNovel.cover?.startsWith('http')) {
        backupNovel.cover = APP_STORAGE_URI + backupNovel.cover;
      }
      await _restoreNovelAndChapters(backupNovel);
    }
  }

  // categories
  const categories: BackupCategory[] = JSON.parse(
    NativeFile.readFile(cacheDirPath + '/' + BackupEntryName.CATEGORY),
  );
  for (const category of categories) {
    await _restoreCategory(category);
  }

  // settings
  restoreMMKVData(
    JSON.parse(
      NativeFile.readFile(cacheDirPath + '/' + BackupEntryName.SETTING),
    ),
  );
};
