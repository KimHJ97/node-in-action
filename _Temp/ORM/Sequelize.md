# Sequelize

Sequelize는 Postgres, MySQL, MariaDB, SQLite, MSSQL 등 여러 DB를 지원하는 ORM이다. 모델은 DB 테이블의 추상화이고, 클래스 형태로 정의하거나 sequelize.define() 방식으로 만들 수 있다.

## 1. Sequelize 사용법

### 1-1. 라이브러리 설치

- `라이브러리 설치`
  - 사용하는 DB 드라이버를 따로 설치해야 한다.

```bash
npm install express sequelize mysql2 dotenv
```

### 1-2. 초기 설정

- `폴더 구조 예시`

```
project/
├─ app.js
├─ .env
├─ config/
│  └─ database.js
├─ models/
│  ├─ index.js
│  └─ user.model.js
└─ routes/
   └─ user.routes.js
```

- `.env`

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=myapp
DB_USER=root
DB_PASSWORD=1234
```

- `config/database.js (Sequelize 연결 설정)`

```javascript
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: console.log, // SQL 로그 보기 싫으면 false
    timezone: "+09:00",
  },
);

module.exports = sequelize;
```

- `models/user.model.js (모델 정의)`
  - Sequelize 모델은 테이블 구조를 표현한다.
  - 모델은 Model을 상속해서 init()으로 정의하거나, sequelize.define()으로 만들 수 있다.

```javascript
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true, // createdAt, updatedAt 자동 생성
  },
);

module.exports = User;
```

- `models/index.js`

```javascript
const sequelize = require("../config/database");
const User = require("./user.model");

const db = {
  sequelize,
  User,
};

module.exports = db;
```

- `index.js`

```javascript
const express = require("express");
const db = require("./models");

const app = express();
app.use(express.json());

async function start() {
  try {
    // DB 연결 테스트
    await db.sequelize.authenticate();
    console.log("DB 연결 성공");

    // 테이블 생성
    // 개발 초기: sync()
    // 운영: migration 직접 사용
    await db.sequelize.sync();
    console.log("테이블 동기화 완료");

    app.listen(3000, () => {
      console.log("서버 실행: http://localhost:3000");
    });
  } catch (error) {
    console.error("실행 실패:", error);
  }
}

start();
```

<br/>

### 1-3. CRUD 작업

- `Create (INSERT)`

```javascript
const { User } = require("./models");

const user = await User.create({
  name: "Kim",
  email: "kim@example.com",
  age: 30,
});

console.log(user.toJSON());
```

- `Read (SELECT)`

```javascript
// 단건 조회 - ID
const user = await User.findByPk(1);

// 단건 조회 - EMAIL
const user = await User.findOne({
  where: { email: "kim@example.com" },
});

// 목록 조회 - 전체
const users = await User.findAll();

// 목록 조회 - 나이 30
const users = await User.findAll({
  where: {
    age: 30,
  },
});
```

- `Update (UPDATE)`

```javascript
// Read & Update
const user = await User.findByPk(1);
if (user) {
  user.name = "Lee";
  await user.save();
}

// Update
await User.update({ name: "Lee" }, { where: { id: 1 } });
```

- `Delete (DELETE)`

```javascript
// Read & Delete
const user = await User.findByPk(1);
if (user) {
  await user.destroy();
}

// Delete
await User.destroy({
  where: { id: 1 },
});
```

- `Raw Query`

```javascript
const [results, metadata] = await sequelize.query(
  "SELECT * FROM users WHERE age >= ?",
  {
    replacements: [20],
  },
);

console.log(results);
```

### 1-4. 사용 예시

- `Express 라우터에서 CRUD 사용`

```javascript
const express = require("express");
const router = express.Router();
const { User } = require("../models");

// 생성
router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 전체 조회
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 단건 조회
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "사용자 없음" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 수정
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "사용자 없음" });
    }

    await user.update(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 삭제
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "사용자 없음" });
    }

    await user.destroy();
    res.json({ message: "삭제 완료" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### 1-5. 트랜잭션

- `트랜잭션 객체 사용`

```javascript
const { sequelize, User, Post } = require("./models");

const t = await sequelize.transaction();

try {
  const user = await User.create(
    { name: "Kim", email: "kim@test.com" },
    { transaction: t },
  );

  await Post.create(
    { title: "첫 글", content: "내용", userId: user.id },
    { transaction: t },
  );

  await t.commit();
} catch (error) {
  await t.rollback();
  throw error;
}
```

- `콜백 스타일`

```javascript
await sequelize.transaction(async (transaction) => {
  const user = await User.create(
    { name: "Park", email: "park@test.com" },
    { transaction },
  );

  await Post.create(
    { title: "트랜잭션 글", content: "내용", userId: user.id },
    { transaction },
  );
});
```
