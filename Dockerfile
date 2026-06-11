FROM mcr.microsoft.com/playwright:v1.58.1-noble
WORKDIR /playwright-tests
COPY package*.json ./
RUN npm install
COPY . .
RUN npx playwright install --with-deps chromium
