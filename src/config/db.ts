export default {
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [`${__dirname}/entity/*.{js, ts}`],
};
