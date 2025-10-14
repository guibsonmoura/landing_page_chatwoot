

import { ComponentType } from 'react';

const Loading = ({ Lottie, loadingAnimation }: { Lottie: ComponentType<any>, loadingAnimation: any }) => {
    return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#13131f] rounded-2xl p-8 border border-gray-800 shadow-2xl">
            <div className="w-32 h-32 mx-auto">
              <Lottie 
                animationData={loadingAnimation} 
                loop={true}
                autoplay={true}
              />
            </div>
            <p className="text-center text-white mt-4 font-medium">
              Criando sua conta...
            </p>
          </div>
        </div>)
}

export {
    Loading
}