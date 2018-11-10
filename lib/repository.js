const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;

const open = promisify(fs.open);
const close = promisify(fs.close);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

const validateFileStructure = (baseDir, repository) =>
{
    return stat(`${baseDir}`)
    .catch(() => {
        console.log(`creating base directory ${baseDir}`);
        mkdir(`${baseDir}`);
    })
    .then(() => stat(`${baseDir}/${repository}`))
    .catch(() => {
        console.log(`creating repository ${repository} directory`);
        mkdir(`${baseDir}/${repository}`);
    })
    .catch((err) => {console.log('error creating repository folder: ', err)});
};

const repository = (repositoryName) => {
    if (typeof repositoryName !== 'string' || repositoryName.length == 0)
      throw new Error('Invalid Repository');
  
    const baseDir = path.join(__dirname, '../.data');
  
    const validateIdentifier = func => async (id, ...data) => {
      if (typeof id !== 'string' || !id.length)
        throw new Error('Invalid id, must be a valid string (cannot be null or empty)');
  
      return func(id, ...data);
    };
  
    validateFileStructure(baseDir, repositoryName);

    const getFileName = (id) => {
        return `${baseDir}/${repositoryName}/${id}.json`;
    }

    /**
    * @param {string} id
    * @param {object} data
    * @throws {EEXIST, EACCES, EISDIR}
    */
    const create = async (id, data) => {
        return await updateOrCreateFile(id, data, 'wx');
    };

    /**
    * @param {string} id
    * @throws {EACCES, EISDIR, ENOENT}
    */
   const read = async (id) => {
        const fileDescriptor = await open(getFileName(id), 'r');
        const data = await readFile(fileDescriptor, 'utf8');
        await close(fileDescriptor);
        return JSON.parse(data);
    };

    /**
    * @param {string} id
    * @param {object} data
    * @throws {EACCES, EISDIR, ENOENT}
    */
    const update = async (id, data) => {
        return await updateOrCreateFile(id, data, 'w');
    };

    /**
    * @param {string} id
    * @throws {EACCES, EISDIR, ENOENT}
    */
    const deleteFile = (id) => {
        return unlink(getFileName(id));
    };

    const updateOrCreateFile = async (id, data, mode) => {
        const fileDescriptor = await open(getFileName(id), mode);
        await writeFile(fileDescriptor, JSON.stringify(data));
        return close(fileDescriptor);
    }

    /**
    * @throws {EACCES, ENOTDIR, ENOENT}
    */
    const list = async () => {
        const fileList = await readDir(`${baseDir}/${repositoryName}`);
        const itemIds =  fileList.map(file => file.trim().replace('.json', ''));
        const items = await Promise.all(itemIds.map(itemId => read(itemId)));
        return items;
    };

    return {
        create: validateIdentifier(create),
        read : validateIdentifier(read),
        update: validateIdentifier(update),
        delete: validateIdentifier(deleteFile),
        list
      }
};

module.exports = repository;