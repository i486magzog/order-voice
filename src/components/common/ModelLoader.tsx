import { useEffect, useState } from "react";
import { cancelLoading, InitProgress, initWebLLM } from "@/lib/web-llm";
import Progress from "@/components/common/SimpleProgress";
import { Button } from "@headlessui/react";

export default function ModelLoader({ onSkip, onProgress }: { onSkip: () => void; onProgress: (percentage: number) => void }) {
  const [percentage, setPercentage] = useState<number | null>(null);
  const [label1, setLabel1] = useState("Loading LLM model...");
  const [label2, setLabel2] = useState("");

  useEffect(() => {
    initWebLLM("Llama-3.1-8B-Instruct-q4f32_1-MLC", (progress: InitProgress) => {
      if (progress.text){
        //
        // If model is already downloaded, the cache is used.
        // progress.text is "Loading model from cache[47/108]: 0MB loaded. 0% completed, 0 secs elapsed. (0%)"
        // Pick the numbers related to percentage from the text.
        //
        const regex = /\[(\d+)\s*\/\s*(\d+)\]/;
        const match = progress.text.match(regex);
        if (match) {
          const loaded = parseInt(match[1]);
          const total = parseInt(match[2]);
          const percentage = Math.round(loaded / total * 100);
          onProgress(percentage);
          setPercentage(percentage);
          setLabel1(`Loading LLM model...`);
          setLabel2(`[ ${loaded}/${total} ]`);
        } else {  // If doesn't match the regex, show the text as it is.
          onProgress(progress.percentage);
          setPercentage(progress.percentage);
          setLabel1(progress.text);
        }
      } else {
        onProgress(progress.percentage);
        setPercentage(progress.percentage);
        setLabel1(`Loading LLM model...`);
        setLabel2(``);
      }
    }).catch((e) => {
      setLabel1("[ERROR] Failed to load model: " + e.message);
      alert("Failed to load model. It will go without LLM.");
      onSkip();
    });
  }, []);

  if (percentage === null) return null; // 아직 콜백이 안 왔으면 렌더 안 함

  return (
    <div className={"fixed inset-0 z-50 flex items-center justify-center bg-black"}>
      <div className="flex flex-col items-center justify-center w-[90vw] sm:w-[200px]">
        <div className="w-full text-sm text-gray-600">{label1}</div>
        <div className="w-full my-2"><Progress value={percentage} /></div>
        <div className="w-full text-sm text-gray-600 text-right">{label2} {percentage}%</div>
        <div className="w-full flex justify-end">
          <Button
            className="rounded bg-sky-600 px-4 py-2 my-10 text-sm text-white data-active:bg-sky-700 data-hover:bg-sky-500"
            onClick={ () => {
              cancelLoading();
              onSkip();
            }}
          >
            Skip LLM
          </Button>
        </div>
      </div>

    </div>
  );
}