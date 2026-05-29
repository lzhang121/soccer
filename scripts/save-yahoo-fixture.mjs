import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

mkdirSync('lib/extractors/fixtures', { recursive: true });

const html = readFileSync('scripts/yahoo-full.html', 'utf8');
const articleStart = html.indexOf('<article');
const articleEnd = html.indexOf('</article>', articleStart);
const articleHtml = html.slice(articleStart, articleEnd + 10);

writeFileSync(
  'lib/extractors/fixtures/yahoo-article.html',
  `<!DOCTYPE html><html><head>
<meta property="og:title" content="日中関係悪化「根源直視を」　閣僚会談見送りで中国（共同通信）">
<meta property="og:description" content=" 【北京共同】中国商務省の何亜東報道官は28日の記者会見で、日本が日中関係悪化の「根源を直視し、正常な交流の条件を整えるよう求める」と述べた。日本は22、23日に江蘇省で開かれたアジア太平洋経済協力">
<meta name="description" content=" 【北京共同】中国商務省の何亜東報道官は28日の記者会見で、日本が日中関係悪化の「根源を直視し、正常な交流の条件を整えるよう求める」と述べた。日本は22、23日に江蘇省で開かれたアジア太平洋経済協力">
<title>日中関係悪化「根源直視を」　閣僚会談見送りで中国（共同通信） - Yahoo!ニュース</title>
</head><body>
<h1 class="site">Yahoo!ニュース</h1>
${articleHtml}
<script>window.__PRELOADED_STATE__={"articleDetail":{"headline":"日中関係悪化「根源直視を」　閣僚会談見送りで中国","paragraphs":[{"textDetails":[{"text":"　【北京共同】中国商務省の何亜東報道官は28日の記者会見で、日本が日中関係悪化の「根源を直視し、正常な交流の条件を整えるよう求める」と述べた。日本は22、23日に江蘇省で開かれたアジア太平洋経済協力会議（APEC）貿易相会合に合わせ、赤沢亮正経済産業相と王文濤商務相の正式な会談を求めたが、中国側が応じなかった。"}]},{"textDetails":[{"text":"　何氏は「両国関係の深刻な困難の根源は高市早苗首相による誤った言動にある」と改めて主張。\\n\\n　赤沢氏から王氏に歩み寄って実施した短時間の立ち話の内容や、この接触が日中関係改善の兆候と言えるかどうかといった質問には直接答えなかった。"}]}]},"pageData":{"title":"日中関係悪化「根源直視を」　閣僚会談見送りで中国（共同通信）"}};</script>
</body></html>`,
);

console.log('wrote fixture', articleHtml.length, 'bytes');
