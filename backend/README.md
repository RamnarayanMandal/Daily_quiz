# Backend

Env:
- Create `.env` with:
  - `PORT=4000`
  - `MONGO_URI=mongodb://127.0.0.1:27017/daily_quiz`

Run:
```bash
npm run dev
```

Seed questions (example):
```bash
curl -X POST http://localhost:4000/api/admin/questions/seed \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"text":"2+2?","options":["3","4","5","6"],"correctIndex":1},
      {"text":"Sun rises from?","options":["North","South","East","West"],"correctIndex":2}
    ]
  }'
```

Aggregate and winners:
```bash
curl -X POST http://localhost:4000/api/admin/aggregate/daily -H "Content-Type: application/json" -d '{}'
curl http://localhost:4000/api/admin/winners/daily
```



