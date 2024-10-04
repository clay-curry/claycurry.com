"use client"
import { useState, useEffect, useMemo, useCallback } from 'react';
export default function AboutPage() {


  return (
    <main>
      <BioTable />
      {
        /*
        <h1>
        Heritage
      </h1>

      My family roots in the United States go at least back to the original
      colonies (<span className='italic'>TODO: build a family tree</span>), but the knowledge from where my ancestors actually emigrated
      before arriving in the Western world is currently lost. This is all the knowledge I currently have about my ancestors.


      Childhood: I should like to imagine that the village who raised me nurtured an
      ambitious challenger of thought, but my adult life has showed me that others are
      probably more up for the job.


      Growing up, it never occurred to me that I might have some unusual ability to notice
      patterns until I got back my mathematics sub-score from the standard college entrance exams
      used in my country. Part of me still believes a charitable database error explains why I found
      myself among the 99.5 percentile of test-takers who score perfectly, this is likely the best
      explanation available for the origins of my interest in programming language compilers.

        */
      }



    </main>
  );
}

function BioTable() {


  const age = useAge('May 19, 1999 10:45:38');

  return (
    <table>
      <tr>
        <td>
          Born
        </td>
        <td>
          May 19, 1999 ({age} years)
        </td>
      </tr>
      <tr>
        <td>
          Home
        </td>
        <td>
          Oklahoma City, OK
        </td>
      </tr>
    </table>)
}


function useAge(birthDateString: string) {

  const birthDate = useMemo(() => new Date(birthDateString), [birthDateString]);

  const calculateAge = useCallback(() => {
    const now = new Date();
    const ageInMilliseconds = now.getTime() - birthDate.getTime(); // Make sure to use getTime() to return a number (milliseconds since epoch)
    const ageDate = new Date(ageInMilliseconds);
    return Math.abs(ageDate.getUTCFullYear() - 1970); // Calculate the number of full years
  }, [birthDate]);

  const [age, setAge] = useState(calculateAge());

  useEffect(() => {
    const now = new Date();
    const nextBirthday = new Date(
      now.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate(),
      birthDate.getHours(),
      birthDate.getMinutes(),
      birthDate.getSeconds()
    );

    if (now >= nextBirthday) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }

    const timeUntilNextBirthday = nextBirthday.getTime() - now.getTime(); // Use getTime() to ensure it's a number

    const timer = setTimeout(() => {
      setAge(calculateAge());
    }, timeUntilNextBirthday);

    return () => clearTimeout(timer);
  }, [birthDate, calculateAge]);

  return age;
};

/*
https://www.truity.com/test-results/bigfive/18708/59459828
Your Personality Trait Scores
This Big Five assessment measures your scores on five major dimensions of personality: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism (sometimes abbreviated OCEAN).


<div class="uvcharts">
    <div class="uvcharts-wrapper uvcharts-wrapper-bar uvcharts-processed" data-uvcharts-id="ca489117b42f7a2d57d6d7b92ce986f2">
    <script type="text/javascript">
      uvChartsAddData('ca489117b42f7a2d57d6d7b92ce986f2', {"config":{"frame":{"bgcolor":"rgba(255,255,255,0)"},"label":{"suffix":"%","fontfamily":"inherit","fontsize":"16px","fontweight":"normal","precision":0,"hor_fontsize":"16px","hor_fontweight":"normal","halfPrecision":1},"margin":{"top":10,"left":150,"right":100,"bottom":30},"legend":{"showlegends":false},"axis":{"strokecolor":"rgba(0,0,0,0)","textcolor":"#0B3C47","fontfamily":"inherit","fontsize":"18px","ticks":10,"showticks":true,"showtext":true,"tick_color":"black","opacity":0.1,"hor_textcolor":"#C6C8C7","max":100},"tooltip":{"format":"%l: %v"},"graph":{"responsive":true,"orientation":"Horizontal","palette":"Android","bgcolor":"rgba(255,255,255,0)","custompalette":["#64a6bf"]},"effects":{"hovercolor":"#CCCCCC","duration":100,"hover":200,"textcolor":"#727272","showhovertext":true},"meta":[],"dimension":{"width":370,"height":208},"bar":{"fontfamily":"inherit","fontsize":"16px","fontweight":"normal","textcolor":"#0000ff"}},"type":"Bar","definition":{"categories":[""],"dataset":{"":[{"name":"Openness","value":98},{"name":"Conscientiousness","value":58},{"name":"Extraversion","value":52},{"name":"Agreeableness","value":48},{"name":"Neuroticism","value":58}]}}});
    </script>
  <div class="uvcharts-chart" id="uvcharts-id-0"><div class="uv-chart-div" style="display: inline-block; width: 100%; height: 100%;"><svg id="uv-1727390706222" class="uv-frame" width="100%" height="100%" preserveAspectRatio="xMinYMin meet" viewBox="0 0 620 248"><rect class="uv-frame-bg" width="620" height="248" style="fill: rgba(255, 255, 255, 0);"></rect><g id="uv-panel-1727390706222" class="uv-panel" transform="translate(150,10)"><rect class="uv-chart-bg" height="208" width="370" style="fill: rgba(255, 255, 255, 0);"></rect><g class="uv-chart" style="opacity: 1;"><g class="cg-" transform="translate(0,0)"><g class="cge-"><rect class="cr-" height="32" x="0" y="8" width="362.59999999999997" style="stroke: none; fill: rgb(100, 166, 191);"></rect><text x="362.59999999999997" y="24" dx="4px" dy=".35em" text-anchor="start" class="cr-" style="fill: rgb(100, 166, 191); font-family: inherit; font-size: 16px; font-weight: normal; transform: scale(1, 1); opacity: 1; cursor: default;">98</text><title>Openness: 98%</title></g><g class="cge-"><rect class="cr-" height="32" x="0" y="48" width="214.6" style="stroke: none; fill: rgb(100, 166, 191);"></rect><text x="214.6" y="64" dx="4px" dy=".35em" text-anchor="start" class="cr-" style="fill: rgb(100, 166, 191); font-family: inherit; font-size: 16px; font-weight: normal; transform: scale(1, 1); opacity: 1; cursor: default;">58</text><title>Conscientiousness: 58%</title></g><g class="cge-"><rect class="cr-" height="32" x="0" y="88" width="192.4" style="stroke: none; fill: rgb(100, 166, 191);"></rect><text x="192.4" y="104" dx="4px" dy=".35em" text-anchor="start" class="cr-" style="fill: rgb(100, 166, 191); font-family: inherit; font-size: 16px; font-weight: normal; transform: scale(1, 1); opacity: 1; cursor: default;">52</text><title>Extraversion: 52%</title></g><g class="cge-"><rect class="cr-" height="32" x="0" y="128" width="177.6" style="stroke: none; fill: rgb(100, 166, 191);"></rect><text x="177.6" y="144" dx="4px" dy=".35em" text-anchor="start" class="cr-" style="fill: rgb(100, 166, 191); font-family: inherit; font-size: 16px; font-weight: normal; transform: scale(1, 1); opacity: 1; cursor: default;">48</text><title>Agreeableness: 48%</title></g><g class="cge-"><rect class="cr-" height="32" x="0" y="168" width="214.6" style="stroke: none; fill: rgb(100, 166, 191);"></rect><text x="214.6" y="184" dx="4px" dy=".35em" text-anchor="start" class="cr-" style="fill: rgb(100, 166, 191); font-family: inherit; font-size: 16px; font-weight: normal; transform: scale(1, 1); opacity: 1; cursor: default;">58</text><title>Neuroticism: 58%</title></g></g></g><g class="uv-caption"><text class="uv-caption-text" y="-5" x="185" text-anchor="middle" style="font-family: Arial; font-size: 14px; font-weight: bold; font-variant: small-caps; text-decoration: none; cursor: default;"></text></g><g class="uv-subcaption"><text class="uv-subcaption-text" y="NaN" x="185" text-anchor="middle" style="font-family: Arial; font-size: 9px; font-weight: normal; font-variant: normal; text-decoration: none; cursor: default;"></text></g><g class="uv-hor-axis" transform="translate(0,208)" style="shape-rendering: crispedges;"><g style="font-family: inherit; font-size: 16px; font-weight: normal;"><g class="tick" transform="translate(0,0)" style="opacity: 1;"><line y2="-208" x2="0" style="stroke: black; opacity: 0.1;"></line><text dy=".71em" y="5" x="0" style="text-anchor: middle; fill: rgb(198, 200, 199); cursor: default;">0</text></g><g class="tick" transform="translate(37,0)" style="opacity: 1;"><line y2="-208" x2="0" style="stroke: black; opacity: 0.1;"></line><text dy=".71em" y="5" x="0" style="text-anchor: middle; fill: rgb(198, 200, 199); cursor: default;">10</text></g><g class="tick" transform="translate(74,0)" style="opacity: 1;"><line y2="-208" x2="0" style="stroke: black; opacity: 0.1;"></line><text dy=".71em" y="5" x="0" style="text-anchor: middle; fill: rgb(198, 200, 199); cursor: default;">20</text></g><g class="tick" transform="translate(111,0)" style="opacity: 1;"><line y2="-208" x2="0" style="stroke: black; opacity: 0.1;"></line><text dy=".71em" y="5" x="0" style="text-anchor: middle; fill: rgb(198, 200, 199); cursor: default;">30</text></g><g class="tick" transform="translate(148,0)" style="opacity: 1;"><line y2="-208" x2="0" style="stroke: black; opacity: 0.1;"></line><text dy=".71em" y="5" x="0" style="text-anchor: middle; fill: rgb(198, 200, 199); cursor: default;">40</text></g><g class="tick" transform="translate(185,0)" style="opacity: 1;"><line y2="-208" x2="0" style="stroke: black; opacity: 0.1;"></line><text dy=".71em" y="5" x="0" style="text-anchor: middle; fill: rgb(198, 200, 199); cursor: default;">50</text></g><g class="tick" transform="translate(222,0)" style="opacity: 1;"><line y2="-208" x2="0" style="stroke: black; opacity: 0.1;"></line><text dy=".71em" y="5" x="0" style="text-anchor: middle; fill: rgb(198, 200, 199); cursor: default;">60</text></g><g class="tick" transform="translate(259,0)" style="opacity: 1;"><line y2="-208" x2="0" style="stroke: black; opacity: 0.1;"></line><text dy=".71em" y="5" x="0" style="text-anchor: middle; fill: rgb(198, 200, 199); cursor: default;">70</text></g><g class="tick" transform="translate(296,0)" style="opacity: 1;"><line y2="-208" x2="0" style="stroke: black; opacity: 0.1;"></line><text dy=".71em" y="5" x="0" style="text-anchor: middle; fill: rgb(198, 200, 199); cursor: default;">80</text></g><g class="tick" transform="translate(333,0)" style="opacity: 1;"><line y2="-208" x2="0" style="stroke: black; opacity: 0.1;"></line><text dy=".71em" y="5" x="0" style="text-anchor: middle; fill: rgb(198, 200, 199); cursor: default;">90</text></g><g class="tick" transform="translate(370,0)" style="opacity: 1;"><line y2="-208" x2="0" style="stroke: black; opacity: 0.1;"></line><text dy=".71em" y="5" x="0" style="text-anchor: middle; fill: rgb(198, 200, 199); cursor: default;">100</text></g><path class="domain" d="M0,0V0H370V0" style="fill: none;"></path></g><g class="uv-axes-label-group" transform="translate(185,NaN)"><text display="block" class="uv-axes-label cal" text-anchor="middle" style="font-size: 18px; font-family: inherit; cursor: default;"></text><text display="block" y="NaN" uv-axes-sub-label="true" class="casl" text-anchor="middle" style="font-family: inherit; cursor: default;"></text></g></g><g class="uv-ver-axis" style="shape-rendering: crispedges;"><g class="uv-axes" style="font-family: inherit; font-size: 16px; font-weight: normal;"><g class="tick" transform="translate(0,24)" style="opacity: 1;"><line x2="-6" y2="0" style="stroke: rgba(0, 0, 0, 0); opacity: 0.1;"></line><text dy=".32em" x="-11" y="0" style="text-anchor: end; fill: rgb(11, 60, 71); cursor: default;">Openness</text></g><g class="tick" transform="translate(0,64)" style="opacity: 1;"><line x2="-6" y2="0" style="stroke: rgba(0, 0, 0, 0); opacity: 0.1;"></line><text dy=".32em" x="-11" y="0" style="text-anchor: end; fill: rgb(11, 60, 71); cursor: default;">Conscientiousness</text></g><g class="tick" transform="translate(0,104)" style="opacity: 1;"><line x2="-6" y2="0" style="stroke: rgba(0, 0, 0, 0); opacity: 0.1;"></line><text dy=".32em" x="-11" y="0" style="text-anchor: end; fill: rgb(11, 60, 71); cursor: default;">Extraversion</text></g><g class="tick" transform="translate(0,144)" style="opacity: 1;"><line x2="-6" y2="0" style="stroke: rgba(0, 0, 0, 0); opacity: 0.1;"></line><text dy=".32em" x="-11" y="0" style="text-anchor: end; fill: rgb(11, 60, 71); cursor: default;">Agreeableness</text></g><g class="tick" transform="translate(0,184)" style="opacity: 1;"><line x2="-6" y2="0" style="stroke: rgba(0, 0, 0, 0); opacity: 0.1;"></line><text dy=".32em" x="-11" y="0" style="text-anchor: end; fill: rgb(11, 60, 71); cursor: default;">Neuroticism</text></g><path class="domain" d="M-6,0H0V208H-6" style="fill: none;"></path></g><g transform="translate(-120,104)rotate(270)"><text class="uv-axes-label cal" text-anchor="middle" style="font-family: inherit; font-size: 18px; cursor: default;"></text><text class="uv-axes-sub-label casl" text-anchor="middle" y="NaN" style="font-family: inherit; cursor: default;"></text></g></g><line class="uv-hor-axis" y1="208" y2="208" x1="0" x2="370" style="stroke: rgba(0, 0, 0, 0);"></line><line class="uv-ver-axis" x1="0" x2="0" y1="0" y2="208" style="stroke: rgba(0, 0, 0, 0);"></line></g></svg></div></div></div>
  </div>


*/