'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import { SearchProvider } from '@/components/context/SearchContext/SearchContext';
import { LanguageProvider } from '@/components/context/LanguageContext/LanguageContext';
import { TransitionProvider } from '@/components/context/TransitionContext/TransitionContext';
import { Toaster } from 'sonner';
import { toastStyles } from '@/utils/customTheme';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ChakraProvider value={defaultSystem}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                <SearchProvider>
                    <LanguageProvider>
                        <TransitionProvider>
                            {children}
                            <Toaster
                                toastOptions={toastStyles}
                                position="bottom-right"
                                visibleToasts={1}
                            />
                        </TransitionProvider>
                    </LanguageProvider>
                </SearchProvider>
            </ThemeProvider>
        </ChakraProvider>
    );
}
