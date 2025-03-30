import MetroTracker from "@/components/metro-tracker";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-green-50 to-green-100">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 md:mb-6 text-green-800 drop-shadow-md">
        Sistema de Monitoramento da Linha Sul
      </h1>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Este é um site não oficial desenvolvido por um usuário comum para
              facilitar a visualização dos trens em tempo real.
            </p>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Não é um site oficial do Metrofor.</li>
                <li>
                  Os dados são obtidos através do documento de horários do
                  Metrofor, atrasos e outras informações não são consideradas.
                </li>
                <li>
                  Para informações oficiais, acesse o site do{" "}
                  <a
                    href="https://www.metrofor.ce.gov.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-800 hover:text-yellow-900 underline"
                  >
                    Metrofor
                  </a>
                </li>
                <li>Não adaptado para domingos e feriados.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <MetroTracker />
    </main>
  );
}
